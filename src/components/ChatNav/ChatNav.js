import React, { useEffect } from "react";
import "./ChatNav.css";
// import SVGs from "../../svgs/SVGs";
import { AiFillDelete } from "react-icons/ai";
import { BiLeftArrowAlt } from "react-icons/bi";
import { IoMdCall } from "react-icons/io";
import { BsCameraVideoFill, BsShareFill } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import { TiArrowForward, TiArrowBack } from "react-icons/ti";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { messageActions, selectedChatsActions } from "../../state/index";
import { useNavigate } from "react-router-dom";

const ChatNav = ({ selectedChats, data, setInfo, setDeleteModal, isGroup, setForward }) => {

    
    const { user } = useSelector(state => state);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setTaggedMessage } = bindActionCreators(messageActions, dispatch);
    const { deleteSelectedChats } = bindActionCreators(selectedChatsActions, dispatch);
    const contactSaved = (userId) => user.contacts.find(c => c.userId == userId);

    const handleCall = (type) => {
        navigate(`/app/call/${type}/call/${data._id}`);
    };

    const handleDelete = () => setDeleteModal(prev => !prev);
    const deleteChats = () => {
        if(selectedChats.length > 0) deleteSelectedChats([]);
    }

    if(selectedChats.length === 0) {
        return (
            <div className="ChatNav">
                <div className={`CN__Left ${data.groupRefId&&"group"}`}>
                    <div className="svgDiv" onClick={() => {
                        deleteChats();
                        navigate("/app/chat");
                    }}>
                        <BiLeftArrowAlt className="cN-icon svgs-white" />
                    </div>
                    <img src={data.img} />
                    <div className="CN__Dets" style={{marginLeft: "5px"}}
                    onClick={() => navigate(`/app/${isGroup?"group":"account"}/info/${data._id}`)}>
                        <span className="name">{data?.userName||data.name}</span>
                        <span className="CND__bottom">
                            {data.groupRefId ? 
                                data.participants.map(val => contactSaved(val.userId)?.userName||val.phoneNumber).join(", ") : 
                                data.lastSeen
                            }
                        </span>
                    </div>
                </div>
                <div className="CN__Right">
                    {/* video icon */}
                    {!data.groupRefId && <div className="svgDiv"
                    onClick={() => handleCall('audio')}>
                        <IoMdCall className="cN-icon svgs-white" />
                    </div>}
                    {/* phone icon */}
                    {!data.groupRefId && <div className="svgDiv margin"
                    onClick={() => handleCall('video')}>
                        <BsCameraVideoFill className="cN-icon svgs-white" />
                    </div>}
                    {/* ellipsis icon */}
                    <div className="svgDiv margin"
                    onClick={() => setInfo(true)}>
                        <FaEllipsisV className="cN-icon svgs-white" /> 
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="ChatNav">
                <div className="CN__Left">
                    <div className="svgDiv">
                        <BiLeftArrowAlt className="cN-icon svgs-white" />
                    </div>
                    <span className="svgDiv">{selectedChats.length}</span>
                </div>
                <div className="CN__Right">
                    {selectedChats.length===1 && 
                        <div className="svgDiv turnLeft"
                        onClick={() => {
                            setTaggedMessage({...selectedChats[0], messageTagged: null});
                            deleteSelectedChats([]);
                        }}>
                            <TiArrowBack className="cN-icon svgs-white" />
                        </div>
                    }
                    <div className="svgDiv margin"
                    onClick={handleDelete}>
                        <AiFillDelete className="cN-icon svgs-white" />
                    </div>
                    {selectedChats.length===1 && 
                        <div className="svgDiv margin"
                        onClick={()=>setForward(true)}>
                            <TiArrowForward className="cN-icon svgs-white" />
                        </div>
                    }
                    {/* ellipsis svg */}
                    <div className="svgDiv margin"
                    onClick={() => setInfo(true)}>
                        <FaEllipsisV className="cN-icon svgs-white" />
                    </div>
                </div>
            </div>
        )
    }
}

export default ChatNav;