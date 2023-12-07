import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import { IoMdCall, IoMdMicOff, IoMdMic } from "react-icons/io";
import Peer from "simple-peer";
import defaultImage from "../../images/avatar.png";
import Timing from "./timing";

const AudioReceive = ({ 
    socket, callerId, receiverId, 
    callerName, closePage, image, signal 
}) => {

    // receiverId here should be user._id

    const [callAccepted, setCallAccepted] = useState(false);
    const myAudioRef = useRef(null);
    const userAudioRef = useRef(null);
    const connectionRef = useRef(null);
    const [endingCall, setEndingCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [userStreamData, setUserStreamData] = useState({ audio: true });
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
                socket.emit('stream-data', { audio: !isMuted, to: callerId });
                setIsMuted(!isMuted);
            }
        }
    };
        
    const answerCall = () => {

        connectionRef.current = new Peer({ 
            initiator: false, trickle: false, stream: streamRef.current 
        });

        connectionRef.current.on('signal', (data) => {
            socket.emit('callAccepted', {
                callerId, receiverId, signal: data, type: 'audio'
            });
        });

        //caller stream
        connectionRef.current.on('stream', (curStream) => {
            userAudioRef.current.srcObject = curStream;
        });

        connectionRef.current.signal(signal);
        callAcceptedRef.current = true;
        setCallAccepted(true);
        
    }

    useEffect(() => {
        // only close since in caller side we would have 
        // made call to update in db after 1 min
        setTimeout(() => {
            if(!callAcceptedRef.current) closePage();
        }, 60000);

        navigator.mediaDevices.getUserMedia({video: false, audio: true})
            .then(curStream => {
                streamRef.current = curStream;
                myAudioRef.current.srcObject = curStream;
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
                <div className='Call__main'>
                    {callAccepted && <div className={`userStream`}>
                        <div className={`stream_mic ${userStreamData.audio}`}>
                            {!userStreamData.audio ? 
                                <IoMdMicOff className='call_icon' /> :
                                <IoMdMic className='call_icon' />
                            }
                        </div>
                    </div>}

                    <div className='call_top'>
                        <img src={image||defaultImage} alt='dp' />
                        <h3>{callerName}</h3>
                        {!callAccepted && <span className='txt-14'>Incoming...</span>}
                        {callAccepted && <Timing callAccepted={callAccepted} />}
                    </div>
                    <audio ref={myAudioRef} className='myAudio' hidden />
                    <audio ref={userAudioRef} className='receiverAudio' hidden />
                </div>
                {callAccepted && <div className='Call__Footer'>
                    <div className='call__Footer'>
                        <div className='mute' onClick={muteCall}>
                            {!isMuted ? 
                                <IoMdMicOff className='call_icon' /> :
                                <IoMdMic className='call_icon' />
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

export default AudioReceive;