import React, { useEffect, useState, useRef } from "react";
import "./Calls.css";
import { useNavigate } from "react-router-dom";
// import SVGs from "../../../svgs/SVGs";
import defaultImage from "../../../svgs/avatar.png";
import { formatTimeInDateForm } from "../../../utils/formatters";
import { getAllCalls } from "../../../services/calls";
import LoadingSpinner from "../../../components/loading/loading";
import ErrorPage from "../../../components/error/error";
import Modal from "../../../components/Modal/Modal";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { IoMdCall, IoMdCopy } from 'react-icons/io';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { callsActions, curCallActions, statusMessageActions, loadedStateActions } from "../../../state/index";
import useClickOutside from "../../../hooks/useClickOutside";
import Contacts from "../../../components/contacts/contacts";
import { BsCameraVideoFill, BsArrowDownLeft, BsArrowUpRight } from "react-icons/bs";
import { BiLeftArrowAlt } from "react-icons/bi";

const Calls = ({ socket }) => {

    const { calls, loadedState, user, chats } = useSelector(state => state);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState((!loadedState?.calls && !error) ? true : false);
    const callOptionRef = useRef(null);
    const [callLink, setCallLink] = useState(false);
    const [callOptions, setCallOptions] = useState(false);
    const [placeCall, setPlaceCall] = useState(false);
    const [callType, setCallType] = useState('video');
    const dispatch = useDispatch();
    const { setCallsData } = bindActionCreators(callsActions, dispatch);
    const { setCurCallData } = bindActionCreators(curCallActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setLoadedState } = bindActionCreators(loadedStateActions, dispatch);
    const [invite, setInvite] = useState(false);
    const [callDetails, setCallDetails] = useState({});

    const copyUrlToClipboard = () => {
        navigator.clipboard.writeText(`/app/call/${callType}/call/${user._id}`);
        setStatusMessage({type:'success',text:'Linked Copied'});
    }

    const contactName = (val) => user.contacts.find(c => c.userId == val._id)?.userName||val.phoneNumber;

    useClickOutside(callOptionRef, ()=>setCallOptions(false));

    useEffect(() => {
        if(!loadedState?.calls) {
            if(loading && !error) {
                // console.log("ran loading in call home page");
                // setCallsData([]);
                // setLoadedState({ calls: true });
                // setLoading(false);

                // uncomment
                getAllCalls()
                    .then(res => {
                        setCallsData(res.data.calls);
                        setLoadedState({ calls: true });
                        setLoading(false);
                    })
                    .catch(err => {
                        setLoading(false);
                        setStatusMessage({type:'error',text:'Network error. Reload Page'})
                        setError(true);
                    })
            }
        } 

    }, []);


    return (
        <div className="Calls">
            {loading && <div className="calls__Loading">
                <LoadingSpinner width={"40px"} height={"40px"} />
            </div>}
            {error && <ErrorPage />}
            {(!loading && !error) && <div className="Call__Wrapper">
                <div className="call__Top" onClick={()=>setCallLink(true)}
                style={{cursor: 'pointer'}}>
                    <div className="call__Div">
                        <div className="call__Img">
                            <img src={user.img||defaultImage} alt="" />
                        </div>
                        <div className="call__Txt">
                            <h3>Create call link</h3>
                            <span>Share a link for your call</span>
                        </div>
                    </div>
                </div>
                {callLink && <Modal closeModal={()=>setCallLink(false)}
                width={'max-content'} openModal={callLink} text={"Share link with"}>
                    <div className="callLink">
                        <div className="callLink-select">
                            <div className="callLink-selected" onClick={()=>setCallOptions(true)}>
                                <span>{callType}</span>
                                <MdKeyboardArrowDown className={`callLink-selected-icon ${callOptions}`} />
                            </div>
                            {callOptions && <div className="callLink-options" ref={callOptionRef}>
                                <div onClick={() => {
                                    setCallType('audio');
                                    setCallOptions(false)
                                }}>Audio</div>
                                <div onClick={() => {
                                    setCallType('video');
                                    setCallOptions(false)
                                }}>Video</div>
                            </div>}
                        </div>
                        <div className="callLinkDiv" onClick={()=>setInvite(true)} style={{cursor:'pointer'}}>
                            <div className="callLink-txt">
                                <span>Share Call Link with someone</span>
                                {/* {`/app/call/${callType}/join/${user._id}?viaCallLink=${true}`} */}
                            </div>
                            {/* <IoMdCopy className="callLink-icon" onClick={copyUrlToClipboard} /> */}
                        </div>
                    </div>
                </Modal>}
                {invite && 
                    <Contacts 
                    closeModal={()=> { setInvite(false); setCallLink(true) }}
                    openModal={invite} socket={socket}
                    message={{link: `/app/call/${callType}/call/${user._id}`, linkType: 'call'}}
                    />
                }
                <div className="tt">Recent</div>
                <ul>
                    {calls.map((val, idx) => (
                        <li className="call__Div" key={`call-${idx}`}>
                             {/* onClick={()=>setCallDetails(val)}> */}
                            <div className="call__Img">
                                <img src={val.account.img||defaultImage} alt="" />
                            </div>
                            <div className="call__Txt">
                                <h3>{contactName(val.account)}</h3>
                                <div className="call__Dets">
                                    <div>
                                        {val.caller === user._id ?
                                            <BsArrowUpRight className="call-home-icons green" /> :
                                            <BsArrowDownLeft className="call-home-icons red" />
                                        }
                                    </div>
                                    <span>{formatTimeInDateForm(val.account.createdAt)}</span>
                                </div>
                            </div>
                            <div className="call__Icon">
                                {val.callType==="audio" ? 
                                    <IoMdCall className="call-home-icons" /> : 
                                    <BsCameraVideoFill className="call-home-icons" />
                                }
                            </div>
                        </li>
                    ))}
                </ul>
            </div>}
            {callDetails._id && <Modal width={"280px"} closeModal={()=>setCallDetails({})}
            openModal={callDetails._id} text={"Call info"}>
                <div className="call-top">
                    <div className="call-info-top">
                        <img src={callDetails.img||defaultImage} alt="" />
                        <div className="call-info-txt"></div>
                        <div className="call-info-icons">
                            <IoMdCall className="call-home-icons green" onClick={()=>navigate(`/app/call/audio/call/${callDetails._id}`)} />
                            <BsCameraVideoFill className="call-home-icons green" onClick={()=>navigate(`/app/call/video/call/${callDetails._id}`)} />
                        </div>
                    </div>
                    <div className="call-info-data">
                        <div className="call-info-div">
                            {/* {<BsArrowDownLeft */}
                        </div>
                    </div>
                </div>
            </Modal>}
            {!loading && <div className="call__Absolute"
            onClick={() => setPlaceCall(true)}>
                <IoMdCall className="call-home-icons" />
            </div>}
            {placeCall && <div className="placeCall">
              <div>
                <div className="pC__Wrapper">
                    <div className="pC__Top">
                        <div className="call__Icon"
                        onClick={() => setPlaceCall(false)}>
                            <BiLeftArrowAlt className="call-home-icons" />
                        </div>
                        <input placeholder="Search contact" />
                    </div> 
                    <ul>
                        {user.contactsData.map((val, idx) => (
                            <li key={`calls-${idx}`} className="pC__List">
                                <img src={val.img||defaultImage} alt="" />
                                <div className="call__Txt contact">
                                    <h3>{val.userName}</h3>
                                    <span>Call this contact </span>
                                </div>
                                {/* <div className="li__Right"> */}
                                    <div className="call__Icon" 
                                    onClick={() => navigate(`/app/call/audio/call/${val.userId}`)}>
                                        <IoMdCall className="call-home-icons" />
                                    </div>
                                    <div className="call__Icon" 
                                    onClick={() => navigate(`/app/call/video/call/${val.userId}`)}>
                                        <BsCameraVideoFill className="call-home-icons" />
                                    </div>
                                {/* </div> */}
                            </li>
                        ))}
                    </ul>
                </div>
              </div>
            </div>}
        </div>
    );
}

export default Calls;