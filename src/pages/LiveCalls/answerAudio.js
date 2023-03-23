import React, { useState, useEffect, useRef } from "react";
import "./Index.css";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// import SVGs from "../../svgs/SVGs";
import { IoMdCall } from "react-icons/io";
import Peer from "simple-peer";
import LoadingSpinner from "../../components/loading/loading"
import { createCall } from "../../services/calls";
import { addCallData } from "../../utils/helpers";
import defaultImage from "../../svgs/avatar.png";
import { formatTimeInSecs } from "../../utils/formatters";
import { useSelector, useDispatch } from "react-redux";
import {bindActionCreators} from "redux";
import { statusMessageActions, callsActions, curCallActions } from "../../state";

const AnswerAudIoMdCall = ({ socket }) => {

    const { callerId } = useParams();
    const { lstPage, viaCallLink } = useSearchParams();
    const navigate = useNavigate();
    const [callAccepted, setCallAccepted] = useState(false);
    const { chats, user, calls, curCall } = useSelector(state => state);
    const { contacts } = user;
    const { userName } = contacts.find(c => c.userId == callerId)||{};
    const caller = chats.find(c => c.account._id == callerId)?.account || {};
    const dispatch = useDispatch();
    const { setCallsData } = bindActionCreators(callsActions, dispatch);
    const { setCurCallData } = bindActionCreators(curCallActions, dispatch);
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
            caller: callerId,
            receiver: user._id,
            accepted: callAccepted,
            callType: 'audio',
            duration: formatTimeInSecs(callTime),
        }
        socket.emit('endCall', {
            caller: callerId,
            receiver: user._id,
            to: callerId,
            ender: user._id,
        });
        setCurCallData({});

        createCall(callData)
            .then(res => {
                setEndingCall(false);
                addCallData(res.data.call, callerId, caller.img||defaultImage, userName||caller.firstName, calls, setCallsData);
                setStatusMessage({type:'success',text:'Call Ended'});
                navigate(-1);
            })
            .catch(err => {
                setEndingCall(false);
                setStatusMessage({type:'error', text:'Error storing call data'});
                navigate(-1);
            })

        if(timeInterval.current) clearInterval(timeInterval.current);

    };
        
    const answerCall = (type) => {

        const peer = new Peer({ initiator: false, trickle: false, stream })
        peer.on('signal', (data) => {
            socket.emit(type, {
                caller: callerId,
                receiver: user._id,
                signal: data,
                callType: 'audio'
            });
        });

        //caller stream
        peer.on('stream', (curStream) => {
            userAudioRef.current.srcObject = curStream;
        });

        if(curCall?.signal) {
            peer.signal(curCall.signal);
            connectionRef.current = peer;
            setCurCallData({...curCall, isInCall: true });
            setCallAccepted(true);
        }
        
    }

    useEffect(() => {
        //after one minute if call not answered
        //call is missed, emit to caller, push to db and leave page
        setTimeout(() => {
            if(!callAccepted) {
                const callData = {
                    caller: callerId,
                    receiver: user._id,
                    received: false,
                    callType: 'audio',
                    time: '00H:00M:00S'
                }
                socket.emit('missCall', {
                    caller: callerId,
                    receiver: user._id
                });
                createCall(callData)
                    .then(res => {
                        setStatusMessage({type:'success',text:'Call Missed'});
                        addCallData(res.data.call, callerId, caller.img||defaultImage, userName||caller.firstName, calls, setCallsData);
                        navigate(-1);
                    })
                    .catch(err => {
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

        socket.on('endedCall', (data) => {
            const callData = {
                caller: user._id,
                receiver: callerId,
                accepted: callAccepted,
                duration: formatTimeInSecs(callTime),
                callType: 'audio',
                createdAt: String(new Date()),
            }
            setCurCallData({});
            addCallData(callData, callerId, caller.img||defaultImage, userName||caller.firstName, calls, setCallsData);
            if(connectionRef.current) connectionRef.current.destroy();
            setStatusMessage({type:'success',message:`${userName||'Other user'} ended the call`});
            return navigate(-1);
        });

        return () => {
            if(timeInterval.current) clearInterval(timeInterval.current);
            if(connectionRef.current) connectionRef.current.destroy();
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
                    <img src={caller?.img||defaultImage} alt="" />
                    <h3>{contacts.find(c => c.userId == callerId)?.userName || caller.firstName}</h3>
                    {!callAccepted && <span>Incoming call...</span>}
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
                    <div className="incomingCall">
                        {(!callAccepted && !viaCallLink) && <div className="answer-call"
                        onClick={() => answerCall('acceptedCall')}>
                            <IoMdCall className="call-icons" />
                        </div>}
                        {callAccepted && <div className="end-call"
                        onClick={endCall}>
                            {!endingCall ? 
                                <IoMdCall className="call-icons" /> : 
                                <LoadingSpinner width={'18px'} height={'18px'} />
                            }
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnswerAudIoMdCall;