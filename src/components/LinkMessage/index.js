import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { getReactions, removeReaction, postReaction } from "../../services/reactions";
import { updateReaction } from "../../utils/helpers";
import { filterArray, splitArr } from "../../utils/helpers2";
import { formatMessageTime } from "../../utils/formatters";
import LoadingSpinner from "../loading/loading";
import Modal from "../Modal/Modal";
import { 
    chatsActions, groupChatsActions, messageActions, 
    statusMessageActions, selectedChatsActions 
} from "../../state/index";
import useLongPress from "../../hooks/useLongPress";
import useSwipe from "../../hooks/useSwipe";
import { useNavigate } from "react-router-dom";
import { fetchGroupAccount, joinGroupLink } from "../../services/groups";
import defaultImage from "../../svgs/avatar.png";
//fix the image to my-chat logo own
import logo from "../../svgs/avatar.png";
import EmojiPicker from "emoji-picker-react";
import useClickOutside from "../../hooks/useClickOutside";
import ReactionEmojiPicker from "../reaction-emoji-picker";

const LinkMessage = ({ 
    idx, data, selectedChats, setSelectedChats, 
    showTop, isGroup, setClickAccount, id,
    socket 
}) => {

    const { contacts, _id, phoneNumber } = useSelector(state => state.user);
    const { chats, groups } = useSelector(state => state);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { deleteSelectedChats } = bindActionCreators(selectedChatsActions, dispatch);
    const { setChatsData } = bindActionCreators(chatsActions, dispatch);
    const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
    const contactSaved = (userId) => (contacts||[]).find(contact => contact.userId == userId)?.userName;
    const { setTaggedMessage } = bindActionCreators(messageActions, dispatch);
    const [ele, setEle] = useState(null);
    const [pos, setPos] = useState(null);
    const [chooseMoreReactions, setChooseMoreReactions] = useState(false);
    const [chooseReactions, setChooseReactions] = useState(selectedChats.length===1 && selectedChats[0]?._id === data._id);
    const [loading, setLoading] = useState(false);
    const [group, setGroup] = useState({});
    const [joinGroup, setJoinGroup] = useState(false);
    const [showReactions, setShowReactions] = useState(null);
    const [reactionsLoading, setReactionsLoading] = useState(false);
    const [allReactions, setAllReactions] = useState({});
    const [reactionType, setReactionType] = useState('All');
    const [removeReactionsLoading, setRemoveReactionsLoading] = useState(false);
    const chooseReactionsRef = useRef(null);
    const moreReactionsRef = useRef(null);

    useClickOutside(chooseReactionsRef, ()=>setChooseReactions(false));
    useClickOutside(moreReactionsRef, ()=>setChooseMoreReactions(false));

    const handleClick = () => {
        if(selectedChats.length > 0) {
            console.log("setChooseReactions to false from click")
            setChooseReactions(false);
            if(!selectedChats.find(chat => chat._id===data._id)) {
                setSelectedChats([...selectedChats,{ ...data, idx }]);
            } else {
                const newSelectedChats = selectedChats.filter(chat => chat._id !== data._id);
                setSelectedChats(newSelectedChats);
            }
        } 
    }

    const handleLongPress = () => {
        if(selectedChats.length===0) {
            console.log("setChooseReactions to true from long-press")
            setChooseReactions(true);
            setSelectedChats([...selectedChats, { ...data, idx }]);
        } else {
            console.log("setChooseReactions to false from long-press else statement")
            setChooseReactions(false);
            deleteSelectedChats([]);
        }
    }

    const handleRightSwipe = () => {
        if(data?.media.length > 1) return;
        setTaggedMessage({...data, messageTagged: null});
    }
    const handleLeftSwipe = () => null;
    const setElementId = () => setEle(data._id);

    const clickEvents = useLongPress(handleClick, handleLongPress, 500);
    const swipeEvents = useSwipe(handleLeftSwipe, handleRightSwipe, 50, setElementId, setPos);

    const handleJoin = () => {
        const link = data.link.split("/");
        const Id = link[link.length-1];
        if(data.linkType == 'call') {
           if(Id !== _id) return navigate(`${data.link}`);
        } else {
            setJoinGroup(true);
            setLoading(true);
            fetchGroupAccount(Id)
                .then(res => {
                    setGroup(res.data.group);
                    setLoading(false);
                })
                .catch(err => {
                    setStatusMessage({type:'error',text:'Network error. Try again.'});
                    setJoinGroup(false);
                    setLoading(false);
                })
        }
    };

    const handleJoinGroup = () => {
        if(loading) return;
        setLoading(true);
        const link = data.link.split("/");
        const Id = link[link.length-1];
        joinGroupLink(Id)
            .then(res => {
                let newGroups = [...groups];
                newGroups.push({ account: group, messagesData: [res.data.message] });
                setGroupChatsData(newGroups);
                socket.emit('joinGroup', { groupId: Id, joiner: {userId: _id, phoneNumber} });
                navigate(`${data.link}`);
                setLoading(false);
            })
            .catch(err => {
                setStatusMessage({type:'error',text:'Network error. Try again.'});
                setLoading(false);
            })
    }

    const getAllReactions = () => {
        setShowReactions(true);
        getReactions(data._id, isGroup ? "gc" : "dm")
            .then(res => {
                setReactionsLoading(false);
                setAllReactions(res.data.reactionData);
            })
            .catch(err => {
                setReactionsLoading(false);
                setStatusMessage({type:'error',text:'Network error fetchng reactions data'});
                setShowReactions(null);
            })
    };
    
    const sendReaction = (emoji) => {
        postReaction(data._id, isGroup ? "gc" : "dm", emoji)
            .then(res => {
                updateReaction(null, null, isGroup ? groups : chats, group ? setGroupChatsData : setChatsData, data.id, data.messageId, res.data.reactions);
                socket.emit('postReaction', {
                    reactions: res.data.reactions, id: data._id,
                    sender: _id, groupId: (isGroup ? id : null), receiver: (isGroup ? null : id),
                });
                // setSelectedReaction(null);
            })
            .catch(err => {
                // setSelectedReaction(null);
                setStatusMessage({type:'error',type:'Error sending reaction'});
            })
    };

    const handleRemoveReaction = (val) => {
        if(val.userId == _id || removeReactionsLoading) return;
        setRemoveReactionsLoading(true);
        removeReaction(data._id, isGroup ? "gc" : "dm")
            .then(res => {
                const newReactions = allReactions.filter(react => react.userId !== _id);
                setAllReactions(newReactions);
                updateReaction(null, null, isGroup ? groups : chats, group ? setGroupChatsData : setChatsData, data.id, data.messageId, newReactions);
                socket.emit('removeReaction', {
                    reactions: newReactions, id: data._id,
                    sender: _id, groupId: (isGroup ? id : null), receiver: (isGroup ? null : id),
                });
                setRemoveReactionsLoading(false);
            })
            .catch(err => {
                setRemoveReactionsLoading(false);
                setStatusMessage({type:'error',text:'Failed to remove reactions. Try again'})
            })
    }


    return (
        <div className={`Link-Message ${data.senderId==_id?"you":"others"}`} {...clickEvents}>
            <div className="Link-Message__Wrapper" {...swipeEvents}
            style={{transform: (ele===data.messageId && pos) && `translateX(${pos}px)`}}>
                {showTop && <div className="Link-Message__Top"
                onClick={() => {
                    if(!group) return;
                    if(!setClickAccount) return;
                    setClickAccount({number: data.senderNumber, userId: data.senderId, clicked: true})
                }}>
                    <div className="senderName" style={{color: data.senderColor}}>
                        {data.senderId == _id ? 'You' : contactSaved(data.senderId)?.contactName||`- ${data.senderName}`}
                    </div>
                    {!contactSaved(data.senderId) && 
                        <div className="senderNumber">{data.senderNumber}
                    </div>}
                </div>}
                <div className="Link-Message-txt">
                    <img src={logo} alt="" />
                    <span>{data.link}</span>
                    <div className="LMT-base" onClick={handleJoin}>
                        {data.linkType=="message" ?
                            "Message" : 
                            data.linkType==="call" ?
                             'Join Call' : 'Join Group'
                        }
                    </div>
                </div>
                <div className="Link-Message__Dets">
                    <span>{formatMessageTime(data.createdAt)}</span>
                    {(data.senderId == _id) && <div>
                        {data.isRead ?
                            <svg 
                            fill={"rgb(130, 211, 255)"} 
                            width="800px" height="800px" viewBox="0 0 32 32" 
                            version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <title>check-double</title>
                                <path d="M30.506 3.97c-0.133-0.121-0.31-0.195-0.505-0.195-0.219 0-0.415 0.093-0.553 0.242l-0 0-20.474 22.377-6.445-6.402c-0.136-0.136-0.323-0.22-0.531-0.22-0.414 0-0.749 0.335-0.749 0.749 0 0.209 0.085 0.398 0.223 0.534l0 0 7 6.953 0.015 0.006 0.007 0.015c0.13 0.122 0.306 0.197 0.499 0.197 0.199 0 0.38-0.080 0.512-0.21l-0 0 0.027-0.011 0.005-0.011 0.017-0.012 20.999-22.953c0.122-0.133 0.197-0.311 0.197-0.506 0-0.219-0.094-0.416-0.243-0.553l-0.001-0.001zM9.229 14.85l0.015 0.006 0.007 0.015c0.13 0.122 0.306 0.196 0.499 0.196 0.201 0 0.383-0.081 0.515-0.212l-0 0 0.024-0.010 0.004-0.010 0.017-0.012 11.268-12.317c0.122-0.133 0.197-0.311 0.197-0.506 0-0.414-0.335-0.749-0.749-0.749-0.219 0-0.415 0.094-0.552 0.243l-0 0.001-10.742 11.74-3.203-3.181c-0.135-0.13-0.318-0.21-0.521-0.21-0.414 0-0.75 0.336-0.75 0.75 0 0.204 0.082 0.389 0.214 0.525l-0-0z"></path>
                            </svg> :
                            (data.isDelivered||isGroup) ?
                                <svg 
                                fill={"#A5A4A4"} 
                                width="800px" height="800px" viewBox="0 0 32 32" 
                                version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <title>check-double</title>
                                    <path d="M30.506 3.97c-0.133-0.121-0.31-0.195-0.505-0.195-0.219 0-0.415 0.093-0.553 0.242l-0 0-20.474 22.377-6.445-6.402c-0.136-0.136-0.323-0.22-0.531-0.22-0.414 0-0.749 0.335-0.749 0.749 0 0.209 0.085 0.398 0.223 0.534l0 0 7 6.953 0.015 0.006 0.007 0.015c0.13 0.122 0.306 0.197 0.499 0.197 0.199 0 0.38-0.080 0.512-0.21l-0 0 0.027-0.011 0.005-0.011 0.017-0.012 20.999-22.953c0.122-0.133 0.197-0.311 0.197-0.506 0-0.219-0.094-0.416-0.243-0.553l-0.001-0.001zM9.229 14.85l0.015 0.006 0.007 0.015c0.13 0.122 0.306 0.196 0.499 0.196 0.201 0 0.383-0.081 0.515-0.212l-0 0 0.024-0.010 0.004-0.010 0.017-0.012 11.268-12.317c0.122-0.133 0.197-0.311 0.197-0.506 0-0.414-0.335-0.749-0.749-0.749-0.219 0-0.415 0.094-0.552 0.243l-0 0.001-10.742 11.74-3.203-3.181c-0.135-0.13-0.318-0.21-0.521-0.21-0.414 0-0.75 0.336-0.75 0.75 0 0.204 0.082 0.389 0.214 0.525l-0-0z"></path>
                                </svg> : 
                                <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                style={{color: "#A5A4A4"}}>
                                    <polygon fill="#A5A4A4" fillRule="evenodd" points="9.707 14.293 19 5 20.414 6.414 9.707 17.121 4 11.414 5.414 10"/>
                                </svg>
                        }
                    </div>}
                </div>
                {data.reactions?.length > 0 && <div className="messageReactions"
                onClick={getAllReactions}>
                    {data.reactions.map((val, idx) => (
                        <div className="emoji" key={`mR-${idx}`}>{val.emoji}</div>
                    ))}
                    <span>{data.reactions.length}</span>
                </div>}
            </div>
            {chooseReactions && 
                <div className="chooseReactions">
                    <div className="reaction-emoji" ref={chooseReactionsRef}>
                        <ReactionEmojiPicker sendEmoji={(emoji) => sendReaction(emoji)}
                        setShowEmojiPicker={()=>{ setChooseReactions(false); setChooseMoreReactions(true) }} />
                    </div>
                </div>
            }
             {/* ref={chooseReactionsRef} */}
            {chooseMoreReactions && <div className="more__Reactions">
                <div className="mR__Wrapper">
                    <EmojiPicker onEmojiClick={(emojiObject) => sendReaction(emojiObject.emoji)} />
                </div>
            </div>}
            {joinGroup && <Modal width={'250px'} openModal={joinGroup}
            closeModal={()=>setJoinGroup(false)} position={"fixed"} text={"Join Group"}>
                <div className="jG">
                    {loading && <div className="jG-loading">
                        <LoadingSpinner width={'30px'} height={'30px'} />
                    </div>}
                    {group._id && <div className="jG-main">
                        <div className="jG-img">
                            <img src={group?.img||defaultImage} alt='' />
                        </div>
                        <h2>{group.name}</h2>
                        <p>{group.description}</p>
                        <span>{group.participants.length} Participants</span>
                        <div className="jG-button" onClick={handleJoinGroup}>
                            {loading ? 
                                <LoadingSpinner width={'30px'} height={'30px'} /> : 
                                'Join Group'
                            }
                        </div>
                    </div>}
                </div>
            </Modal>}
            {(showReactions !== null) && <Modal width={'250px'} position={"fixed"}
            closeModal={() => setShowReactions(null)} openModal={showReactions} text={"Reactions"}>
                <div className="Reactions">
                    {reactionsLoading && <div className="Reactions__Loading">
                        <LoadingSpinner width={'40px'} height={'40px'} />
                    </div>}
                    {!reactionsLoading && <div className="Reactions__Div">
                        <div className="RD-top">
                            {splitArr(allReactions).map((val, idx) => (
                                <div className={`RDT-div ${reactionType==val.emoji}`}
                                key={`RDT-div-${idx}`} onClick={()=>setReactionType(val.emoji)}>
                                    <div className="emoji">{val.emoji}</div>
                                    <span>{val.amount}</span>
                                </div>
                            ))}
                        </div>
                        <div className="RD-main">
                            {filterArray(allReactions, reactionType).map((val,idx) => (
                                <div key={`reactions-${idx}`} className="RDM-div"
                                onClick={() => handleRemoveReaction(val)} 
                                style={{ cursor: val.userId == _id && "pointer" }}>
                                    <img src={val.img} />
                                    <div className="RDM-txt">
                                        <span>{val.name}</span>
                                        {val.userId == _id && <p>Tap to remove</p>}
                                    </div>
                                    {val.userId !== _id ?
                                        <div className="emoji">{val.emoji}</div> :
                                        !removeReactionsLoading ?
                                            <div className="emoji">{val.emoji}</div> :
                                            <LoadingSpinner width={'12px'} height={'12px'} />
                                    }
                                </div>
                            ))}
                        </div>
                    </div>}
                </div>
            </Modal>}
        </div>
    )
}

export default LinkMessage;