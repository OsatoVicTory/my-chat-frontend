import React, { useState, useRef, useEffect } from "react";
import "./Index.css";
import Peer from "simple-peer";
import LoadingSpinner from "../../components/loading/loading"
import { useSelector, useDispatch } from "react-redux";
import {bindActionCreators} from "redux";
import { statusMessageActions, callsActions, curCallActions } from "../../state";
import { createCall } from "../../services/calls";
import { formatTimeInSecs } from "../../utils/formatters";
// import SVGs from "../../svgs/SVGs";
import { IoMdCall } from "react-icons/io";
import { addCallData } from "../../utils/helpers";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import defaultImg from "../../svgs/avatar.png";

const AudIoMdCall = ({ socket }) => {

    const { receiverId } = useParams();
    const { lstPage, viaCallLink } = useSearchParams();
    const navigate = useNavigate();
    const [callAccepted, setCallAccepted] = useState(false);
    const { chats, user, calls, curCall } = useSelector(state => state);
    const receiver = chats.find(chat => chat.account._id == receiverId)?.account;
    const dispatch = useDispatch();
    const { contacts } = user;
    const { userName } = contacts.find(c => c.userId == receiverId)||{};
    const { setCurCallData } = bindActionCreators(curCallActions, dispatch);
    const { setCallsData } = bindActionCreators(callsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const myAudioRef = useRef(null);
    const userAudioRef = useRef(null);
    const connectionRef = useRef(null);
    const timeInterval = useRef(null);
    const [callTime, setCallTime] = useState(0);
    const [endingCall, setEndingCall] = useState(false);
    const [stream, setStream] = useState(null);

    const endCall = () => {
        if(endingCall) return;
        setEndingCall(true);
        const callData = {
            caller: user._id,
            receiver: receiverId,
            accepted: callAccepted,
            duration: formatTimeInSecs(callTime),
            callType: 'audio',
        }
        socket.emit('endCall', {
            caller: user._id,
            receiver: receiverId,
            to: receiverId,
            ender: user.firstName,
        });

        setCurCallData({});

        createCall(callData)
            .then(res => {
                setEndingCall(false);
                setStatusMessage({type:'success',text:'Call Ended'});
                addCallData(res.data.call, receiverId, receiver.img||defaultImg, userName||receiver.firstName, calls, setCallsData);
                navigate(-1);
            })
            .catch(err => {
                setEndingCall(false);
                setStatusMessage({type:'error', text:'Error storing call data'});
                navigate(-1);
            })
            

    };

    useEffect(() => {
        //after one minute if call not answered
        //call is missed, emit to caller, push to db and leave page
        setTimeout(() => {
            if(!callAccepted) {
                const callData = {
                    caller: user._id,
                    receiver: receiverId,
                    received: false,
                    duration: formatTimeInSecs(callTime),
                    callType: 'audio',
                }
                socket.emit('missCall', { caller: user._id, receiver: receiverId });

                setCurCallData({});

                createCall(callData)
                    .then(res => {
                        if(connectionRef.current) connectionRef.current.destroy();
                        setStatusMessage({type:'error',text:'Call Missed'});
                        addCallData(res.data.call, receiverId, receiver.img||defaultImg, userName||receiver.firstName, calls, setCallsData);
                        navigate(-1);
                    })
                    .catch(err => {
                            if(connectionRef.current) connectionRef.current.destroy();
                            setStatusMessage({type:'error', text:'Error storing call data'});
                            navigate(-1);
                        })
                    
            }
        }, 60000);

        navigator.mediaDevices.getUserMedia({video: false, audio: true})
        .then(curStream => {
            setStream(curStream);
            myAudioRef.current.srObject = curStream;
        });

        socket.on('userInCall', (data) => {
            setStatusMessage({type:'error',text:'User is currently in a call. Try again later'});
            navigate(-1);
        });

        const peer = new Peer({ initiator: true, trickle: false, stream })
        peer.on('signal', (data) => {
            socket.emit('callingUser', {
                caller: user._id,
                receiver: receiverId,
                signal: data,
                callType: 'video'
            });
        });

        peer.on('stream', (curStream) => {
            userAudioRef.current.srcObject = curStream;
        });
        connectionRef.current = peer;
        socket.on('callAccepted', (data) => {
            setCallAccepted(true);
            connectionRef.current.signal(data.signal);
        })

        socket.on('endedCall', (data) => {
            setCurCallData({});
            const callData = {
                caller: user._id,
                receiver: receiverId,
                accepted: callAccepted,
                duration: formatTimeInSecs(callTime),
                callType: 'audio',
                createdAt: String(new Date()),
            }
            addCallData(callData, receiverId, receiver.img||defaultImg, userName||receiver.firstName, calls, setCallsData);
            if(connectionRef.current) connectionRef.current.destroy();
            setStatusMessage({type:'success',message:`${userName||receiver.firstName} ended the call`});
            return navigate(-1);
        });

        return () => {
            setCurCallData({});
            if(connectionRef.current) connectionRef.current.destroy();
            if(timeInterval.current) clearInterval(timeInterval.current);
        }

    }, []);

    useEffect(() => {
        if(callAccepted) {
            timeInterval.current = setInterval(() => {
                setCallTime(prev => prev + 1);
            }, 1000);
        }
    }, [callAccepted]);

    return (
        <div className="LiveCall">
            <div className="LiveCall__Wrapper">
                <div className="LC__Main">
                    <img src={receiver?.img||defaultImg} alt="" />
                    <h3>{userName}</h3>
                    {!callAccepted && <span>Calling</span>}
                    {callAccepted && <h2>{formatTimeInSecs(callTime)}</h2>}
                    {callAccepted && <audio ref={myAudioRef} />
                        // <div className="myVideo">
                        //     <audio ref={myVideoRef} />
                        // </div>
                    }
                    {callAccepted && <audio ref={userAudioRef} />
                        // <div className="Video">
                        //     <audio ref={userVideoRef} />
                        // </div>
                    }
                </div>
                <div className="LC__Bottom">
                    <div className="LCB__Divs">
                        {/* <div className="video">{SVGs.videoGrey}</div>
                        <div className="cursor">{SVGs.microphoneCall}</div> */}
                        <div className="cursor end-call"
                        onClick={endCall}>
                            {!endingCall ? 
                                <IoMdCall className="call-icons" />: 
                                <LoadingSpinner width={'20px'} height={'20px'} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AudIoMdCall;