import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import LoadingSpinner from "../loading/loading";
import "./contacts.css";
// import SVGs from "../../svgs/SVGs";
import { AiOutlineClose } from "react-icons/ai";
import { BiLeftArrowAlt } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import { MdSend } from "react-icons/md";
import { shareLinkMessage, forwardMessage } from "../../services/user";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { chatsActions, groupChatsActions, statusMessageActions } from "../../state";
import { sharedMessageLink, forwardMessageData } from "../../utils/helpers2";

//message => { link: '/app/call/join//:id' or '/app/group/:id', linkType: 'call' or 'group'}
const Contacts = ({ closeModal, openModal, socket, message, type }) => {

    const { groups, chats, user } = useSelector(state => state);
    const [lists, setLists] = useState([]);
    const [curList, setCurList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendLoading, setSendLoading] = useState(false);
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const { setChatsData } = bindActionCreators(chatsActions, dispatch);
    const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const [search, setSearch] = useState(null);

    useEffect(() => {
        if(lists.length == 0 && (chats.length || groups.length || user.contactsData.length)) {
            let Lists = [];
            chats.map(val => {
                Lists.push({
                    ...val.account, type: 'chats',
                    userName:  user.contacts.find(c => c.userId == val.account._id)?.userName
                });
            });
            if(message?.linkType && message?.linkType !== 'call') {
                groups.map(val => {
                    Lists.push({...val.account, type: 'group'});
                });
            }
            user.contactsData.map(val => {
                if(!Lists.find(li => li._id === val?._id || li._id === val?.userId)) {
                    Lists.push({...val, _id: val?.userId||val._id, type:'contacts'});
                }
            });
            setLists(Lists);
            setCurList(Lists);
            setLoading(false);
        }
    }, [lists]);

    const handleSend = () => {
        if(sendLoading) return;
        setSendLoading(true);
        const selectedIds = selected.map(val => val._id);
        if(type !== "message") {
            shareLinkMessage(selected, message)
                .then(res => {
                    socket.emit('sendLink', { targets: selectedIds, sender: user, message: res.data.messages });
                    sharedMessageLink(res.data.accounts, res.data.messages, chats, setChatsData, groups, setGroupChatsData);
                    setStatusMessage({type:'success',text:'Sent Message Successfully'});
                    setSendLoading(false);
                })
                .catch(err => {
                    setStatusMessage({type:'error',text:'Network error. Try again'});
                    setSendLoading(false);
                })
        } else {
            forwardMessage(selected, message)
                .then(res => {
                    socket.emit('forwardMessage', {targets: selectedIds, sender: user, message: res.data.messages});
                    forwardMessageData(res.data.accounts, res.data.messages, chats, setChatsData, groups, setGroupChatsData);
                    setStatusMessage({type:'success',text:'Message Forwarded successfully'});
                    setSendLoading(false);
                })
                .catch(err => {
                    setStatusMessage({type:'error',text:'Network error. Try again'});
                    setSendLoading(false);
                })
        }
    }

    const handleSearch = (e) => {
        const { value } = e.target;
        const newList = lists.filter(ele => (
            ele.name == value || ele?.phoneNumber == value || 
            ele?._id == value || ele?.userName == value 
        ));
        setCurList(newList);
    }

    return (
        <Modal closeModal={()=>closeModal()} zIndex={"999999999"} height={"80%"}
        width={'280px'} openModal={openModal} text={"Share with"}>
            <div className="Contacts-div">
                {loading && <div className="CD-loading">
                    <LoadingSpinner width={'30px'} height={'30px'} />
                </div>}
                {!loading && <div className="DC-main">
                    <div className="DCM-top">
                        <div className="DCM-top-arrow" onClick={()=>closeModal()}>
                           <BiLeftArrowAlt className="contact-icon svgs-black" />
                        </div>
                        {search === null ?
                            <span>Share link with</span> :
                            <input placeholder="Search..." onChange={handleSearch} />
                        }
                        <div className="DCM-search" onClick={() => {
                            if(search === null) setSearch('');
                            else setSearch(null);
                        }}>
                            {search === null ? 
                                <BsSearch className="contact-icon svgs-black" /> :
                                <AiOutlineClose className="contact-icon svgs-black" />
                            }
                        </div>
                    </div>
                    <ul className="DCM-ul">
                        {curList.map((val, idx) => (
                            <li key={`DCM-li-${idx}`} className="DCM-li">
                                {(val.type !== lists[idx-1]?.type) && <span>{val.type}</span>}
                                <div className={`DCML ${selected.find(s => s._id == val._id) ? 'true':'false'}`} 
                                onClick={() => {
                                    if(selected.find(s => s._id == val._id)) {
                                        setSelected(prev => prev.filter(p => p._id !== val._id));
                                    } else {
                                        setSelected([...selected, val])
                                    }
                                }}>
                                    <img src={val.img} alt='' />
                                    <div className="DCML-txt">
                                        <h2>{val.name||val.userName||val.phoneNumber}</h2>
                                        <span>{val?.about||''}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {selected.length > 0 && <div className="DCM-base">
                        <div className="DCM-base-div">
                            <div className="DCM-base-lists">
                                <div className="DCM-overflower">
                                    {selected.map((val, idx) => (
                                        <div key={`DCMB-${idx}`}>
                                            {val.name||val.userName||val.phoneNumber}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="DCMB-send" onClick={handleSend}>
                                {!sendLoading ?
                                    <MdSend className="contact-icon svgs-black" /> :
                                    <LoadingSpinner width={'18px'} height={'18px'} />
                                }
                            </div>
                        </div>
                    </div>}
                </div>}
            </div>
        </Modal>
    )
};

export default Contacts;