import { useState, useRef, useEffect } from 'react';
import './styles.css';
import { IoMdCall, IoMdMicOff, IoMdMic } from "react-icons/io";
import Peer from "simple-peer";
import defaultImage from "../../images/avatar.png";
import Timing from './timing';

const AudioCall = ({ 
    socket, callerId, receiverId, receiverName, 
    closePage, image, userName, setStatusMessage, img  
}) => {

    const [callAccepted, setCallAccepted] = useState(false);
    const myAudioRef = useRef(null);
    const userAudioRef = useRef(null);
    const connectionRef = useRef(null);
    const [endingCall, setEndingCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [streamReady, setStreamReady] = useState(false);
    const [userStreamData, setUserStreamData] = useState({ audio: true });
    const streamRef = useRef();
    const acceptedRef = useRef(false);

    const endCallApi = async (data) => {
        try {
            // 
        } catch(err) {
            console.log(err);
        }
    };

    const endCall = () => {
        if(endingCall) return;
        setEndingCall(true);
        const callData = {
            callerId, receiverId, ender: callerId,
            accepted: callAccepted, type: 'audio',
        };
        endCallApi(callData);
        socket.emit('endCall', { callerId, receiverId, to: receiverId, ender: callerId }); 
        closePage();      
    };

    function muteCall() {
        if(streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks();
            if(audioTracks.length > 0) {
                audioTracks[0].enabled = !isMuted;
                socket.emit('stream-data', { audio: !isMuted, to: receiverId });
                setIsMuted(!isMuted);
            }
        }
    };

    useEffect(() => {
        //after one minute if call not answered
        //call is missed, emit to caller, push to db and leave page
        setTimeout(() => {
            if(!acceptedRef.current) endCall();
        }, 60000);

        navigator.mediaDevices.getUserMedia({video: false, audio: true})
        .then(curStream => {
            streamRef.current = curStream;
            if(!streamReady) setStreamReady(true);
            myAudioRef.current.srcObject = curStream;
        });

        socket.on('userInCall', (data) => {
            setStatusMessage({ type:'error',
                text: 'User is currently in a call. Try again later'
            });
            closePage();
        });

        socket.on('endedCall', (data) => {
            const callData = {
                callerId: data.callerId,
                receiverId: data.receiverId,
                ender: data.ender,
                accepted: callAccepted,
                type: 'audio',
                createdAt: String(new Date()),
            };
            endCallApi(callData);
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

    useEffect(() => {
        if(streamReady) {
            
            connectionRef.current = new Peer({ 
                initiator: true, trickle: false, stream: streamRef.current 
            });

            connectionRef.current.on('signal', (data) => {
                socket.emit('callingUser', { 
                    callerId, receiverId, signal: data, 
                    type: 'audio', image: img, callerName: userName
                });
            });
            
            socket.on('callAccepted', (data) => {
                setCallAccepted(true);
                acceptedRef.current = true;
                connectionRef.current.signal(data.signal);
            });

            connectionRef.current.on('stream', (curStream) => {
                userAudioRef.current.srcObject = curStream;
            });

            setTimeout(() => {
                if(!acceptedRef.current) {
                    const callData = {
                        callerId, receiverId,
                        ender: receiverId,
                        accepted: callAccepted,
                        type: 'audio',
                        createdAt: String(new Date()),
                    };
                    endCallApi(callData);
                    closePage();
                }
            }, 60000);
        }
    }, [streamReady]);

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
                        <h3>{receiverName}</h3>
                        {!callAccepted && <span className='txt-14'>Calling...</span>}
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
            </div>
        </div>
    )
};

export default AudioCall;