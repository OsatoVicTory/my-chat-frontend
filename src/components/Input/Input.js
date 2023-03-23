import React, { useState, useRef, useEffect } from "react";
// import SVGs from "../../svgs/SVGs";
import { BsEmojiSmile, BsCardImage } from "react-icons/bs";
import { MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import "./Input.css";
import LoadingSpinner from "../loading/loading";
import TaggedText from "../TaggedText/TaggedText";
import { useSelector, useDispatch } from "react-redux";
import { sendDirectMessage } from "../../services/chats";
import { sendGroupMessage } from "../../services/groups";
import { sentMessage } from "../../utils/helpers";
// import { formatTextForLinks } from "../../utils/formatters";
import { bindActionCreators } from "redux";
import { chatsActions, groupChatsActions, statusMessageActions } from "../../state/index";
import StatusTagged from "../StatusTagged/StatusTagged";
import Emoji from "../Emoji";

const Input = ({ 
    socket, account, chats, setChats, status,
    id, statusData, isGroup
}) => {

    const [sendLoading, setSendLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [imagesSelected, setImagesSelected] = useState([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);
    const user = useSelector(state => state.user);
    const { contacts, _id, userColor, refId, phoneNumber, userName, img } = user;
    const taggedMessage = useSelector(state => state.message);
    const { chatsData, groupChatsData } = useSelector(state => state);
    const dispatch = useDispatch();
    const { setChatsData } = bindActionCreators(chatsActions, dispatch);
    const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const contactSaved = (userId) => (contacts||[]).find(contact => contact.userId == userId);
    const filterImgs = (id, val) => {
        let newImgs = [];
        for(let i=0;i<imagesSelected.length;i++) {
            if(i !== id) newImgs.push(imagesSelected[i]);
            else URL.revokeObjectURL(imagesSelected[i]);
        };
        setImagesSelected(newImgs);
    }

    useEffect(() => {
        return () => imagesSelected.map(val => URL.revokeObjectURL(val));
    }, []);

    const sortAndMergeIds = (first, sec) => {
        let i=10, minn = Math.min(first.length, sec.length);
        while(i<minn) {
            if(first[i] < sec[i]) return first+sec;
            else if(first[i] > sec[i]) return sec+first;
            else i++;
        }
        return minn == first.length ? first+sec : sec+first;
    };

    const handleChange = (e) => {
        socket.emit(isGroup?'typingToGroup':'typingToOne', {
            to: id,
            typerId: user._id,
            typerNumber: user.phoneNumber,
        })
        setMessage(e.target.value);
    }

    const handleBlur = (e) => {
        socket.emit(isGroup?'stopTypingToGroup':'stopTypingToYou', {
            to: id,
            typerId: user._id,
            typerNumber: user.phoneNumber,
        });
    }

    const handleSendMessage = () => {
        if(!message && imagesSelected.length===0) return;
        if(sendLoading) return;
        setSendLoading(true);
        let messageData = {
            messageTagged: taggedMessage._id ? taggedMessage : null,
            status: statusData, message,
            images: imagesSelected,
            senderName: userName, senderNumber: phoneNumber,
            senderImg: img,
            senderRefId: refId, receiverRefId: account.refId,
            senderId: _id, senderColor: userColor,
            accountsInvolvedId: sortAndMergeIds(refId, account.refId)
        };
        const sendMessage = async () => {
            try {
                let res;
                if(isGroup) {
                    res = await sendGroupMessage(id, messageData);
                    socket.emit('sendGroupMessage', {sender: _id, receiver: id, message: res.data.messageData, groupId: id, account: account});
                    sentMessage(chats, setChats, groupChatsData, setGroupChatsData, account, res.data.messageData, id)
                } else {
                    res = await sendDirectMessage(messageData);
                    socket.emit('sendMessage', {sender: _id, receiver: id, message: res.data.messageData, account: account});
                    sentMessage(chats, setChats, chatsData, setChatsData,  account, res.data.messageData, id)
                }

                setStatusMessage({type:'success',text:'Message sent successfully'})
            } catch(err) {
                setSendLoading(false);
                setStatusMessage({type:'error',text:'Network error. Try again'})
            }
        }
        sendMessage();
    }

    return (
        <div className="Bottom">
            <div className="Bottom__Wrapper">
                {(taggedMessage.senderId&&!status) && <div className="BottomTagged">
                    <TaggedText 
                    taggedData={taggedMessage}
                    input={true}
                    contactSaved={contactSaved}
                    />
                </div>}
                {status && 
                    <StatusTagged status={statusData} input={true} />
                }
                <div className="Bottom__Top">
                    <div className="inputsDiv">
                        <div onClick={()=>setShowEmoji(!showEmoji)}>
                            <BsEmojiSmile className="Input-icons" />
                        </div>
                        <textarea placeholder="Message..." onFocus={()=>null}
                        onChange={handleChange} onBlur={handleBlur} ref={inputRef} />
                        <div style={{marginLeft: "10px"}}>
                            <label htmlFor="message-input">
                                <BsCardImage className="Input-icons" />
                            </label>
                            <input type="file" id="message-input" 
                            onChange={(e) => {
                                const File = e.target.files[0];
                                if(!['.png','.jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                                
                                if(File.size > 2048048) return setStatusMessage({type:'error', text:'File cannot be more than 2MB'})
                                setImagesSelected([...imagesSelected, File])
                            }} />
                        </div>
                    </div>
                    <div className="senderDiv">
                        <div className="txtNote" onClick={handleSendMessage}>
                            {!sendLoading ? 
                                <MdSend className="Input-icons" /> : 
                                <LoadingSpinner width={'12px'} height={'12px'} />
                            }
                        </div>
                    </div>
                </div>
                {imagesSelected.length > 0 && <div className="imagesSelected">
                    <div className="imagesSelectedDiv">
                        <ul>
                            {imagesSelected.map((val, idx) => (
                                <li key={`images-${idx}`} className="iS__List">
                                    <img src={URL.createObjectURL(val)} />
                                    <div className="iS__Cancel"
                                    onClick={() => filterImgs(idx, val)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                                        strokeLinejoin="round" className="x" style={{color: "black"}}>
                                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>}
                {showEmoji && <div className="input-emoji">
                    <Emoji 
                    message={message} 
                    setMessage={setMessage} 
                    refCurrent={inputRef.current}
                    cursorPosition={cursorPosition}
                    setCursorPosition={setCursorPosition}
                    />
                </div>}
            </div>
        </div>
    )
}

export default Input;