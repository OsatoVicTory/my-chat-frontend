import React, { useState, useRef, useEffect } from "react";
import "./StatusHome.css";
import { useNavigate } from "react-router-dom";
import { MdSend } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { statusActions, statusMessageActions, statusUploadImageActions } from "../../../state/index";
import LoadingSpinner from "../../../components/loading/loading";
import { postStatus } from "../../../services/status";
import { addMyNewPost } from "../../../utils/helpers";
import Emoji from "../../../components/Emoji";
// import { AiFillEdit, AiOutlinePlus } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { BiLeftArrowAlt } from "react-icons/bi";

const UploadStatusImage = ({ socket }) => {

    const [postLoading, setPostLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [statusCaption, setStatusCaption] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { status, user } = useSelector(state => state);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setStatusUploadImageData } = bindActionCreators(statusUploadImageActions, dispatch);
    const { setStatusData } = bindActionCreators(statusActions, dispatch);
    const { img, _id, refId, whoSeesMyStatus } = user;
    const image = useSelector(state => state.statusUploadImage);
    const inputRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const handlePostStatus = async (type) => {
        if(postLoading || !image.name) return;
        setPostLoading(true);
        let postData = {
            posterId: _id, posterRefId: refId,
            statusValue: image, statusType: type,
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

    useEffect(() => {
        return () => {
            if(image.name) URL.revokeObjectURL(image);
            // setStatusUploadImageData({});
        }
    }, []);

    return (
        <div className="Write__Status">
            <div className="wS">
                <div className="wS__Wrapper">
                    <div className="wS__Top">
                        <div className="wS__Icon"
                        onClick={() => navigate("/app/status")}>
                            <BiLeftArrowAlt className="status-home-icons" />
                        </div>
                    </div>
                    <div className="wS__Main">
                        <div className="wS__Main__Img">
                            {!image.name && <LoadingSpinner width={'30px'} height={'30px'} />}
                            {image.name && <img src={URL.createObjectURL(image)} alt="" />}
                        </div>
                    </div>
                    {/* add emoji-picker below */}
                    <div className="wS__UploadImg__Base">
                        <div className="wUB__Top__Wrapper">
                            <BsEmojiSmile className="status-home-icons" 
                            onClick={() => setShowEmoji(!showEmoji)}/>
                            <textarea placeholder="Type a Caption" ref={inputRef}
                            onChange={(e) => setStatusCaption(e.target.value)} />
                            <div className="wS__Send" onClick={() => handlePostStatus('text')}>
                                {!postLoading ? 
                                    <MdSend className="status-home-icons" /> : 
                                    <LoadingSpinner width={'18px'} height={'18px'} />
                                }
                            </div>
                        </div>
                        {showEmoji && <div className="wUB__Emoji">
                            <div className="wUB__Emoji__Wrapper">
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
                </div>
            </div>
        </div>
    )
}

export default UploadStatusImage;