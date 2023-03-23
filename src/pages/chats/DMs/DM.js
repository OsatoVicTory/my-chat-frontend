import React, { useEffect, useState, useRef } from "react";
import "./DM.css";
import LoadingSpinner from "../../../components/loading/loading";
import Message from "../../../components/Message/Message";
import ChatNav from "../../../components/ChatNav/ChatNav";
import { 
    getSpecificDirectMessages, deleteAllDirectMessagesForMe,
    deleteOneDirectMessageForAll, deleteSpecificDirectMessagesForMe,
    readDirectMessages, getUserDetails
} from "../../../services/chats.js";
import { goToTaggedMessage } from "../../../utils/chats";
import { saveContact } from "../../../services/user";
import Input from "../../../components/Input/Input";
import LinkMessage from "../../../components/LinkMessage";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { chatsActions, statusMessageActions, selectedChatsActions, userActions } from "../../../state/index";
import useClickOutside from "../../../hooks/useClickOutside";
import { useParams } from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import { 
    deleteMessages, readAllMessages, 
    clearAllChatsForMe, deletedMessageForAll,
} from "../../../utils/helpers";
import ErrorPage from "../../../components/error/error";
import Contacts from "../../../components/contacts/contacts";


const DM = ({ socket }) => {
    
    const user = useSelector(state => state.user);
    const { contacts, contactsData } = user;
    const chatsData = useSelector(state => state.chats);
    const selectedChats = useSelector(state => state.selectedChats);
    const focusTaggedMessage = useSelector(state => state.focus);
    const dispatch = useDispatch();
    const { setUserData } = bindActionCreators(userActions, dispatch);
    const { setChatsData } = bindActionCreators(chatsActions, dispatch);
    const { setSelectedChats, deleteSelectedChats } = bindActionCreators(selectedChatsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { id } = useParams();
    const acct = chatsData.find(chat => chat.account._id == id);
    const [loading, setLoading] = useState(!acct ? true : false);
    const [chats, setChats] = useState(acct?.messagesData||[]);
    const [account, setAccount] = useState(acct?.account||{});
    const [info, setInfo] = useState(null);
    const infoRef = useRef(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [saveLoading, setSaveLoading ] = useState(false);
    const [addToContacts, setAddToContacts] = useState(false);
    const [unReads, setUnReads] = useState(0);
    const [error, setError] = useState(false);
    const [contactName, setContactName] = useState(null);
    const [forward, setForward] = useState(false);
    const [shareContact, setShareContact] = useState(false);

    useEffect(() => {
        if(!acct) {
            if(loading && !error) {
                getSpecificDirectMessages(id)
                    .then(res => {
                        setChats(res.data.messages);
                        setAccount(res.data.account);
                        setUnReads(res.data.unReads);
                        setLoading(false);
                    })
                    .catch(err => {
                        setStatusMessage({ type: 'error',text: "Network connection failure, reload the page" });
                        setError(true);
                        setLoading(false);
                    })
                }
        } else {
            if(loading && !error) {
                getUserDetails(id)
                    .then(res => {
                        setChats([]);
                        setAccount(res.data.account);
                        setUnReads(0);
                        setLoading(false);
                    })
                    .catch(err => {
                        setStatusMessage({ type: 'error',text: "Network connection failure, reload the page" });
                        setError(true);
                        setLoading(false);
                    })
            }
        };
        
        //read all messages on initial mount
        if(typeof socket?.on !== "undefined") {
            readDirectMessages(id)
                .then(res => {
                    readAllMessages(chats, setChats, chatsData, setChatsData, id);
                    // setReadCall(true);
                })
                .catch(err => setStatusMessage({ type: 'error', text: "Network failure. Reload the page" }))

            socket.on('readAllMessages', (data) => {
                readDirectMessages(id)
                    .then(res => readAllMessages(chats, setChats, chatsData, setChatsData, id))
                    .catch(err => setStatusMessage({ type: 'error', text: "Network failure. Reload the page" }))
            })
        }


    }, []);

    useEffect(() => {
        for(var i=0;i<chatsData.length;i++) {
            if(chatsData[i].account._id == id) {
                let newChats = [...chatsData];
                setAccount(chatsData[i].account);
                setChats(chatsData[i].messagesData);
                break;
            }
        }
    }, [JSON.stringify(chatsData)]);

    useEffect(() => {
        if(selectedChats.length > 0) {
            goToTaggedMessage(selectedChats[selectedChats.length-1]?._id, (val)=>null);
        } 
    });

    const goDown = () => {
        if(chats.length > 0) {
            goToTaggedMessage(chats[chats.length-1]?._id, (val)=>null);
        }
    };

    const handleClearChats = async () => {
        deleteAllDirectMessagesForMe(id)
            .then(res => {
                clearAllChatsForMe(setChats, chatsData, setChatsData, id);
                setStatusMessage({ type: 'success', text: res.data.message });
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: err.data.message });
            })
    };

    const deleteForEveryone = (msg) => {
        deleteOneDirectMessageForAll(msg._id)
            .then(res => {
                socket.emit('deleteMessageForAll', {
                    to: id,
                    messageId: msg._id,
                    deleter: user._id
                });
                deletedMessageForAll(chats, setChats, chatsData, setChatsData, msg._id, id);
                setStatusMessage({ type: 'success', text: res.data.message });
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: err.data.message });
            })
    }

    const deleteSpecificMessagesForMe = () => {
        deleteSpecificDirectMessagesForMe(selectedChats)
            .then(res => {
                deleteMessages(chats, setChats, chatsData, setChatsData, id, selectedChats);
                deleteSelectedChats([]);
                setStatusMessage({ type: 'success', text: res.data.message||"Success" });
            })
            .catch(err => {
                setStatusMessage({ type: 'error', text: err.data.message });
            })
    };

    const handleSaveContact = () => {
        if(saveLoading || !contactName || contactName=='') return;
        setSaveLoading(true);
        saveContact(contactName, id)
            .then(res => {
                setSaveLoading(false);
                setStatusMessage({ type: 'success', text: res.data.message });
                setAddToContacts(false);
                const userData = {userId:id,userName:contactName};
                setUserData({contacts:[...contacts,userData], contactsData:[...contactsData, {...userData,img:account.img,about:account.about,phoneNumber:account.phoneNumber}]})
            })
            .catch(err => {
                setSaveLoading(false);
                setStatusMessage({ type: 'error', text: err.data.message });
                // setAddToContacts(false);
            })
    }

    useClickOutside(infoRef, () => setInfo(null));

    const isFocus = (id) => {
        if(selectedChats.find(chat => chat._id===id)) return true;
        return focusTaggedMessage===id;
    }

    return (
        <div className="DM">
            <div className="DM__Wrapper">
                {(!loading && !error) && <div className="DM__Top">
                    <ChatNav selectedChats={selectedChats} setForward={setForward}
                    data={account} setInfo={setInfo} setDeleteModal={setDeleteModal} />
                </div>}
                {loading && <div className="DM__Loading">
                    <LoadingSpinner width={"60px"} height={"60px"} />
                </div>}
                {info && <div className="dm__Info" ref={infoRef}>
                    <div className="dm-info-div">
                        <div>Contact Info</div>
                        <div onClick={()=>setShareContact(true)}>Share Contact</div>
                        <div onClick={handleClearChats}>Clear All Chats</div>
                        <div onClick={()=>setAddToContacts(true)}>Add to contact</div>
                    </div>
                </div>}
                {error && <ErrorPage />}
                {(!loading && !error) && <ul className="DM__Lists">
                    {chats.map((val, idx) => (
                        <li key={`DM-${idx}`}> 
                            {( unReads > 0 && (chats.length - unReads == (idx+1)) ) &&
                                <div className="DM__unReads">{unReads} messages</div>
                            }
                            {val.time && <div className="DM__time">
                                <div>{val.time}</div>
                            </div>}
                            <div id={`Message-${val._id}`}
                            className={`DM__li ${isFocus(val._id)}`}>
                                {val.link ?
                                    <LinkMessage  
                                    showTop={false}
                                    data={val} idx={idx} id={id}
                                    selectedChats={selectedChats}
                                    setSelectedChats={setSelectedChats} 
                                    setClickAccount={null}
                                    /> :
                                    <Message 
                                        showTop={false}
                                        data={val} idx={idx}
                                        selectedChats={selectedChats} id={id}
                                        setSelectedChats={setSelectedChats} 
                                        setClickAccount={null} socket={socket}
                                    />
                                }
                            </div>
                        </li>
                    ))}
                </ul>}
                <Input socket={socket} id={id}
                chats={chats} setChats={setChats}
                setChatsData={setChatsData} chatsData={chatsData} />
            </div>
            {/* <div className="goDown"></div> */}
            {shareContact && <Contacts openModal={shareContact} socket={socket}
            closeModal={()=>setShareContact(false)} type={"message"}
            message={{
                link: `/app/chat/dm/${account._id}`, senderColor: user.userColor,
                senderId: user._id, senderName: user.userName,
                senderNumber: user.phoneNumber, linkType: "message"
            }} />}
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
            {addToContacts && <Modal closeModal={() => setAddToContacts(false)} display={true}
            openModal={addToContacts} width={'min(300px, 95%)'} shade={'shade'}>
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

export default DM;