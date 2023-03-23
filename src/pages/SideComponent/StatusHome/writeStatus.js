import React, { useState, useRef } from "react";
import "./StatusHome.css";
import html2canvas from 'html2canvas';
import { useNavigate } from "react-router-dom";
import { MdSend } from "react-icons/md";
import useClickOutside from "../../../hooks/useClickOutside";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { statusActions, statusMessageActions } from "../../../state/index";
import LoadingSpinner from "../../../components/loading/loading";
import { postStatus } from "../../../services/status";
import { addMyNewPost } from "../../../utils/helpers";
import Emoji from "../../../components/Emoji";
// import { AiFillEdit, AiOutlinePlus } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { BiLeftArrowAlt } from "react-icons/bi";

const WriteStatus = ({ socket }) => {

    const [postLoading, setPostLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [statusCaption, setStatusCaption] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { status, user } = useSelector(state => state);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setStatusData } = bindActionCreators(statusActions, dispatch);
    const { img, _id, refId, whoSeesMyStatus } = user;
    const emojiRef = useRef(null);
    const inputRef = useRef(null);
    const statusEleRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(0);

    useClickOutside(emojiRef, ()=>setShowEmoji(false));
    
    const handlePostStatus = async (type) => {
        if(postLoading || !statusCaption) return;
        setPostLoading(true);
        const canvas = await html2canvas(statusEleRef.current);
        const url = canvas.toDataURL('image/png');
        let postData = {
            posterId: _id, posterRefId: refId,
            statusValue: url, statusType: type,
            caption: statusCaption
        }
        try {
            const { data } = await postStatus(postData);
            setPostLoading(false);
            addMyNewPost(data.postData, status, setStatusData);
            socket.emit('sendStatus', {...data.postData, to: [...whoSeesMyStatus], posterImg: img});
            setStatusCaption(null);
            setStatusMessage({type:'success',text:'Status posted successfully'});
            
        } catch (err) {
            setPostLoading(false);
            setStatusMessage({type:'error',text:'Failed to post status update. Check internet and try again'});
        }
    }

    return (
        <div className="Write__Status">
            <div className="wS">
                <div className="wS__Wrapper">
                    <div className="wS__Top">
                        <div className="wS__Icon"
                        onClick={() => navigate("/app/status")}>
                            <BiLeftArrowAlt className="status-home-icons" />
                        </div>
                        <div className="wS__Right">
                            <div className="wS__Icon" style={{cursor:'pointer'}}
                             onClick={()=>setShowEmoji(!showEmoji)}>
                                <BsEmojiSmile className="status-home-icons" />
                            </div>
                            {/* <div className="wS__Icon">{SVGs.edit}</div> */}
                        </div>
                    </div>
                    <div className="wS__Main" ref={statusEleRef}>
                        <textarea placeholder="Type a status" ref={inputRef}
                        onChange={(e) => setStatusCaption(e.target.value)} />
                        
                        {showEmoji && <div className="status-emoji fixed" ref={emojiRef}>
                            <div className="status__Emoji__Wrapper">
                                <Emoji 
                                message={statusCaption}
                                setMessage={setStatusCaption}
                                refCurrent={inputRef.current}
                                cursorPosition={cursorPosition}
                                setCursorPosition={setCursorPosition}
                                />
                            </div>
                        </div>}
                    </div>
                    {/* add emoji-picker below */}
                    <div className="wS__Base">
                        <div className="wS__Send" onClick={() => handlePostStatus('text')}>
                            {!postLoading ? 
                                <MdSend className="status-home-icons" /> : 
                                <LoadingSpinner width={'18px'} height={'18px'} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WriteStatus;