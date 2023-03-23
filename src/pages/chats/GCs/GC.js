import React, { useEffect, useState, useRef } from "react";
import "./GC.css";
import LoadingSpinner from "../../../components/loading/loading";
import Message from "../../../components/Message/Message";
import ChatNav from "../../../components/ChatNav/ChatNav";
import { 
    leftGroupPage, deleteSpecificGroupMessagesForMe,
    getAndReadSpecificGroupMessages, deleteAllGroupMessagesForMe,
    deleteOneGroupMessageForAll, readAllGroupMessages
} from "../../../services/groups.js";
import { saveContact } from "../../../services/user";
import Input from "../../../components/Input/Input";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { groupChatsActions, statusMessageActions, selectedChatsActions, userActions } from "../../../state/index";
import useClickOutside from "../../../hooks/useClickOutside";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import { 
    deleteMessages, clearAllChatsForMe,
    receiveMessagesSentToYou, deletedMessageForAll,
} from "../../../utils/helpers";
import ErrorPage from "../../../components/error/error";
import LinkMessage from "../../../components/LinkMessage";
import Contacts from "../../../components/contacts/contacts";


const GC = ({ socket }) => {

    const user = useSelector(state => state.user);
    const { contacts, contactsData } = user;
    const navigate = useNavigate();
    const groupChatsData = useSelector(state => state.groups);
    const selectedChats = useSelector(state => state.selectedChats);
    const focusTaggeGCessage = useSelector(state => state.focus);
    const dispatch = useDispatch();
    const { setUserData } = bindActionCreators(userActions, dispatch);
    const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
    const { setSelectedChats, deleteSelectedChats } = bindActionCreators(selectedChatsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { id, refId } = useParams();
    const acct = groupChatsData.find(acc => acc.account._id == id);
    const [chats, setChats] = useState(acct?.messagesData||[]);
    const [account, setAccount] = useState(acct?.account||{});
    const [loading, setLoading] = useState(!acct ? true : false);
    const [info, setInfo] = useState(null);
    const infoRef = useRef(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [saveLoading, setSaveLoading ] = useState(false);
    const [clickAccount, setClickAccount] = useState(false);
    const [unReads, setUnReads] = useState(0);
    const [addToContactsId, setAddToContactsId] = useState(null);
    const [contactName, setContactName] = useState(null);
    const [error, setError] = useState(false);
    const [forward, setForward] = useState(false);

    useEffect(() => {
        if(!acct && loading && !error) {
            const userLastView = user.userGroups.find(g => g.groupRefId == refId)?.lastView;
            getAndReadSpecificGroupMessages(refId, userLastView)
                .then(res => {
                    setChats(res.data.messages);
                    setAccount({...res.data.account, group:true});
                    setUnReads(res.data.unReads);
                    setLoading(false)
                })
                .catch(err => {
                    setLoading(false);
                    setStatusMessage({ type: 'error',text: "Network connection failure, reload the page" });
                    setError(true);
                })
        } 
        
        // if(!readCall) {
        readAllGroupMessages(refId)
            .then(res => {
                receiveMessagesSentToYou(chats, setChats, groupChatsData, setGroupChatsData, id, {...res.data.message});
                // setReadCall(true);
            })
            .catch(err => setStatusMessage({ type: 'error', text: "Network failure. Reload page" }))
        // }
    }, []);
    
    useEffect(() => {
        return () => {
            leftGroupPage(refId).catch(err => setStatusMessage({type:'error',text:"Network Error"}));
        }
    }, []);

    useEffect(() => {
        for(var i=0;i<groupChatsData.length;i++) {
            if(groupChatsData[i].account._id == id) {
                setAccount(groupChatsData[i].account);
                setChats(groupChatsData[i].messagesData);
                break;
            }
        }
    }, [JSON.stringify(groupChatsData)]);

    const handleClearChats = async () => {
        deleteAllGroupMessagesForMe(refId)
            .then(res => {
                clearAllChatsForMe(setChats, groupChatsData, setGroupChatsData, id);
                setStatusMessage({ type: 'success', text: res.data.message });
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: "Network problem, failed to delete" });
            })
    };

    const deleteForEveryone = (msg) => {
        deleteOneGroupMessageForAll(msg._id)
            .then(res => {
                socket.emit('deleteGroupMessageForAll', {
                    groupId: id,
                    messageId: msg._id,
                    deleter: user._id
                });
                deletedMessageForAll(chats, setChats, groupChatsData, setGroupChatsData, msg._id, id);
                setStatusMessage({ type: 'success', text: res.data.message });
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: "Network problem, failed to delete" });
            })
    }

    const deleteSpecificMessagesForMe = () => {
        deleteSpecificGroupMessagesForMe(selectedChats)
            .then(res => {
                deleteMessages(chats, setChats, groupChatsData, setGroupChatsData, id, selectedChats);
                deleteSelectedChats([]);
                setStatusMessage({ type: 'success', text: res.data.message||"Success" });
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: "Network problem, failed to delete" });
            })
    };

    const handleSaveContact = () => {
        if(saveLoading || !contactName || contactName=='') return;
        setSaveLoading(true);
        const data = [...user.contacts, {userId: addToContactsId, userName: contactName}];
        saveContact(data)
            .then(res => {
                setSaveLoading(false);
                setStatusMessage({ type: 'success', text: res.data.message });
                setAddToContactsId(null);
                const userData = {userId:id,userName:contactName};
                setUserData({contacts:[...contacts,userData], contactsData:[...contactsData, {...userData,img:account.img,about:account.about,phoneNumber:account.phoneNumber}]})
            })
            .catch(err => {
                setSaveLoading(false);
                setStatusMessage({ type: 'error', text: err.data.message });
            })
    };

    useClickOutside(infoRef, () => setInfo(null));

    const isFocus = (id) => {
        if(selectedChats.find(chat => chat._id===id)) return true;
        return focusTaggeGCessage===id;
    }

    return (
        <div className="GC">
            <div className="GC__Wrapper">
                {(!loading && !error) && <div className="GC__Top">
                    <ChatNav selectedChats={selectedChats} isGroup={true} setForward={setForward}
                    data={account} setInfo={setInfo} setDeleteModal={setDeleteModal} />
                </div>}
                {loading && <div className="GC__Loading">
                    <LoadingSpinner width={"60px"} height={"60px"} />
                </div>}
                {error && <ErrorPage />}
                {info && <div className="GC__Info" ref={infoRef}>
                    <div className="GC-info-div">
                        <div onClick={()=>navigate(`/app/group/info/${id}`)}>Contact Info</div>
                        <div onClick={handleClearChats}>Clear All Chats</div>
                    </div>
                </div>}
                {(!loading && !error) && <ul className="GC__Lists">
                    {chats.map((val, idx) => (
                        <li key={`GC-${idx}`}> 
                            {( unReads > 0 && (chats.length - unReads == (idx+1)) ) &&
                                <div className="GC__unReads">{unReads} messages</div>
                            }
                            {val.time && <div className="GC__time">
                                <div>{val.time}</div>
                            </div>}
                            {val.messageType ?
                                <div className="GC__time">
                                    <div>{val.message}</div>
                                </div> :
                                <div id={`Message-${val._id}`}
                                className={`GC__li ${isFocus(val._id)}`}>
                                    {val.link ?
                                        <LinkMessage  
                                            showTop={(idx===0) || (idx>0 && chats[idx-1].senderId==chats[idx].senderId)}
                                            data={val} idx={idx} id={id}
                                            isGroup={true}
                                            selectedChats={selectedChats}
                                            setSelectedChats={setSelectedChats}
                                            setClickAccount={setClickAccount} 
                                        /> :
                                        <Message 
                                            showTop={idx>0 && chats[idx-1].senderName==chats[idx].senderName}
                                            data={val} idx={idx} group={true}
                                            selectedChats={selectedChats} id={id}
                                            setSelectedChats={setSelectedChats} 
                                            setClickAccount={setClickAccount}
                                            socket={socket}
                                        />
                                    }
                                </div>
                            }
                        </li>
                    ))}
                </ul>}
                <Input socket={socket} />
            </div>
            {forward && <Contacts openModal={forward} socket={socket} type={"message"}
            closeModal={()=>setForward(false)} message={selectedChats[0]} />}
            {deleteModal && <Modal closeModal={() => setDeleteModal(false)} display={true}
            openModal={deleteModal} width={'250px'} shade={'shade'}>
                <div className="deleteModal">
                    <div className="dlM-top"></div>
                    <div className="dlM-main">
                        <h2>Delete {selectedChats.length} messages ?</h2>
                        <span onClick={deleteSpecificMessagesForMe}>For Me</span>
                        {(selectedChats[0].senderRefId == user.refId && selectedChats.length == 1) && 
                        <span onClick={() => deleteForEveryone(selectedChats[0])}>For everyone</span>}
                    </div>
                </div>
            </Modal>}
            {clickAccount.clicked && <Modal closeModal={() => setClickAccount({...clickAccount, clicked: false})} display={true}
            openModal={clickAccount.clicked} width={'min(300px, 95%)'} shade={'shade'}>
                <div className="addToContacts">
                    <div className="aTC-top"></div>
                    <div className="aTC-main">
                        <div className="aTC-route" onClick={()=>navigate(`/app/chat/dm/${clickAccount.userId}`)}>
                            Message {clickAccount.number}
                        </div>
                        <div className="aTC-route" 
                        onClick={() => {
                            setAddToContactsId(clickAccount.userId);
                            setClickAccount({});
                        }}>
                            Add {clickAccount.number} to contacts
                        </div>
                    </div>
                </div>
            </Modal>}
            {addToContactsId && <Modal closeModal={() => {
                setAddToContactsId(false);
                setClickAccount({...clickAccount, clicked: true})
            }} display={true}
            openModal={addToContactsId} width={'min(280px, 95%)'} shade={'shade'}>
                <div className="addToContacts">
                    <div className="aTC-top"></div>
                    <div className="aTC-main">
                        <input placeholder="Contact Name"
                        onChange={(e) => setContactName(e.target.value)} />
                        <div className="aTC-save"
                        onClick={handleSaveContact}>
                            {saveLoading && <LoadingSpinner width={'15px'} height={'15px'} />}
                            {!saveLoading && <span>Save</span>}
                        </div>
                    </div>
                </div>
            </Modal>}
        </div>
    )
}

export default GC;