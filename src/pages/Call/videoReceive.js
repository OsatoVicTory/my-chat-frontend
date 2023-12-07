import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import { IoMdCall, IoMdMicOff, IoMdMic } from "react-icons/io";
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import Peer from "simple-peer";
import defaultImage from "../../images/avatar.png";
import Timing from "./timing";

const VideoReceive = ({
    socket, callerId, receiverId, 
    callerName, closePage, image, signal 
}) => {

    const [callAccepted, setCallAccepted] = useState(false);
    const myVideoRef = useRef(null);
    const userVideoRef = useRef(null);
    const connectionRef = useRef(null);
    const [endingCall, setEndingCall] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [userStreamData, setUserStreamData] = useState({ video: true, audio: true });
    const streamRef = useRef();
    const callAcceptedRef = useRef(false);

    const endCall = () => {
        socket.emit('endCall', { callerId, receiverId, to: callerId, ender: receiverId });
        closePage();
    };

    function muteCall() {
        if(streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks();
            if(audioTracks.length > 0) {
                audioTracks[0].enabled = !isMuted;
                socket.emit('stream-data', { audio: !isMuted, video: isVideoOn, to: callerId });
                setIsMuted(!isMuted);
            }
        }
    };

    function toggleVideo() {
        if(streamRef.current) {
            const videoTracks = streamRef.current.getVideoTracks();
            if(videoTracks.length > 0) {
                videoTracks[0].enabled = !isVideoOn;
                socket.emit('stream-data', { audio: isMuted, video: !isVideoOn, to: callerId });
                setIsVideoOn(!isVideoOn);
            }
        }
    };
        
    const answerCall = () => {

        if(!streamRef.current) {
            console.log('no stream yet');
            return;
        }

        connectionRef.current = new Peer({ 
            initiator: false, trickle: false, stream: streamRef.current 
        });
        
        connectionRef.current.on('signal', (data) => {
            socket.emit('callAccepted', { 
                callerId, receiverId, signal: data, type: 'video' 
            });
        });
        
        connectionRef.current.signal(signal);
        callAcceptedRef.current = true;
        setCallAccepted(true);

        //caller stream
        connectionRef.current.on('stream', (curStream) => {
            userVideoRef.current.srcObject = curStream;
        });
    }

    useEffect(() => {
        // only close since in caller side we would have 
        // made call to update in db after 1 min
        setTimeout(() => {
            if(!callAcceptedRef.current) closePage();
        }, 60000);

        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(curStream => {
                streamRef.current = curStream;
                myVideoRef.current.srcObject = curStream;
            });

        socket.on('endedCall', (data) => {
            closePage();
        });

        socket.on('stream-data', (data) => {
            setUserStreamData({ ...data });
        });

        return () => {
            if(connectionRef.current) connectionRef.current.destroy();
            streamRef.current?.getTracks().forEach((track) => track.stop());
        }

    }, []);
    
    return (
        <div className='Call'>
            <div className='Call__Container'>
                <div className={`Call__main video ${callAccepted}`}>
                    {callAccepted && <div className={`userStream video`}>
                        <div className={`stream_mic ${userStreamData.audio}`}>
                            {!userStreamData.audio ? 
                                <IoMdMicOff className='call_icon' /> :
                                <IoMdMic className='call_icon' />
                            }
                        </div>
                        <div className={`stream_vid ${userStreamData.video}`}>
                            {!userStreamData.video ? 
                                <FaVideoSlash className='call_icon' /> :
                                <FaVideo className='call_icon' />
                            }
                        </div>
                    </div>}

                    <div className='call_top'>
                        {!callAccepted && <img src={image||defaultImage} alt='dp' />}
                        <h3>{callerName}</h3>
                        {!callAccepted && <span className='txt-14'>Incoming...</span>}
                        {callAccepted && <Timing callAccepted={callAccepted} />}
                    </div>
                    <video playsInline ref={myVideoRef} autoPlay className='myVideo' />
                    <div className={`placeholder-image ${(!callAccepted||!userStreamData.video)&&'show'}`}></div>
                    <video playsInline ref={userVideoRef} autoPlay className='receiverVideo' />
                </div>
                {callAccepted && <div className='Call__Footer'>
                    <div className='call__Footer'>
                        <div className='mute' onClick={muteCall}>
                            {isMuted ? 
                                <IoMdMicOff className='call_icon' /> :
                                <IoMdMic className='call_icon' />
                            }
                        </div>
                        <div className='video-button' onClick={toggleVideo}>
                            {isVideoOn ? 
                                <FaVideoSlash className='call_icon' /> :
                                <FaVideo className='call_icon' />
                            }
                        </div>
                        <div className='cancel' onClick={endCall}>
                            <IoMdCall className='call_icon' />
                        </div>
                    </div>
                </div>}
                {!callAccepted && <div className='Call__Footer center'>
                    <div className='answer' onClick={answerCall}>
                        <IoMdCall className='call_icon' />
                    </div>
                </div>}
            </div>
        </div>
    )
};

export default VideoReceive;