import React, { useEffect, useState } from "react";
import "./Chats.css";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/loading/loading";
import Modal from "../../../components/Modal/Modal";
import { getAllDirectMessages } from "../../../services/chats";
import { searchForUsers } from "../../../services/user";
import { useSelector, useDispatch } from 'react-redux';
import { chatsActions, statusMessageActions, loadedStateActions } from "../../../state";
import { bindActionCreators } from "redux";
import defaultImage from "../../../svgs/avatar.png";
// import SVGs from "../../../svgs/SVGs";
import { formatTime, formatMessageTime } from "../../../utils/formatters";
import ErrorPage from "../../../components/error/error";
import { getFakeAccounts } from "../../../utils/routings";
import { AiOutlinePlus } from "react-icons/ai";
import { BiLeftArrowAlt } from "react-icons/bi";
import { BsCameraVideoFill, BsSearch, BsCardImage } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";

const Chats = () => {

    const chatsData = useSelector(state => state.chats);
    const { user, loadedState } = useSelector(state => state);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setChatsData } = bindActionCreators(chatsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setLoadedState } = bindActionCreators(loadedStateActions, dispatch);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState((!loadedState?.chats && !error) ? true : false);
    const [usersDataLoading, setUsersDataLoading] = useState(false);
    const [addUser, setAddUser] = useState(false);
    const [usersData, setUsersData] = useState({});
    const [input, setInput] = useState(null);
    const [unReads, setUnReads] = useState(0);

    useEffect(() => {

        if(!loadedState?.chats) {
            if(loading && !error) {
                // console.log("ran loading in chats home page");
                // setChatsData(getFakeAccounts());
                // setLoadedState({ chats: true });
                // setLoading(false);

                // uncomment
                getAllDirectMessages()
                    .then(res => {
                        setChatsData(res.data.messages);
                        setLoadedState({ chats: true });
                        setLoading(false);
                    })
                    .catch(err => {
                        setError(true);
                        setLoading(false);
                        setStatusMessage({type: 'error',text: 'Network failure. Reload the page'})
                    })
            }
        } 

    }, []);

    const startChat = (val) => {
        if(!chatsData.find(c => c.account._id === val._id)) setChatsData([{account: val, messagesData: []}, ...chatsData]);
        navigate(`/app/chat/dm/${val._id}`)
    };

    const handleSearch = () => {
        if(usersDataLoading) return;
        if(!input) return setStatusMessage({type:'error',text:'Input is empty'});
        setUsersDataLoading(true);
        searchForUsers(input)
            .then(res => {
                setUsersData(res.data.users);
                setUsersDataLoading(false);
            })
            .catch(err => {
                setStatusMessage({type:'error',text:'Network error. Try again'});
                setUsersDataLoading(false);
            })
    }

    const Text = ({ val }) => {
        if(val?.images[0]?.img) {
            return (
                <div className="Text">
                    <BsCardImage className="chat-home-icons" />
                    <span>{val.text||'Photo'}</span>
                </div>
            )
        } else {
            return (
                <div className="Text">
                    <span>{val.text}</span>
                </div>
            )
        }
    }

    return (
        <div className="chats">
            {loading && <div className="chatsLoading">
                <LoadingSpinner width={"60px"} height={"60px"} />
            </div>}
            {error && <ErrorPage />}
            {(!loading&&!error) && <ul className="chatsLists">
                {chatsData.map((val, idx) => (
                    <li key={`chats-${idx}`} onClick={() => navigate(`/app/chat/dm/${val.account._id}`)}>
                        <div className="chats__Img">
                            <img src={val.account?.img||defaultImage} />
                        </div>
                        <div className="chatsDets">
                            <div className="chats__Tops">
                                <div className="h3">{user.contacts.find(c => c.userId == val.account._id)?.userName||val.account.phoneNumber}</div>
                                <div className="span">{formatMessageTime(val.messagesData[val.messagesData.length-1].createdAt)}</div>
                            </div>
                            {val.isTyping && <div className="chats__Bottom">
                                <div className="span typing">typing...</div>
                            </div>}
                            {!val.isTyping && <div className="chats__Bottom">
                                <div className="span">
                                    <Text val={val.messagesData[val.messagesData.length-1]} />
                                </div>
                                {val.unreadMessages && <div className="unreadMessages">
                                    <span>{val.unreadMessages}</span>
                                </div>}
                            </div>}
                        </div>
                    </li>
                ))}
            </ul>}
            <div className="statusAbsolutes">
                <div onClick={() => setAddUser(true)}
                className="wS__Edit">
                    <AiOutlinePlus className="chat-home-icons" />
                </div>
            </div>
            {addUser && <Modal width={'250px'} openModal={addUser}
            closeModal={() => setAddUser(false)} text={"Add a user"}>
                <div className="addUser">
                    <div className="aU-top">
                        <input placeholder='Enter user name or phone number' 
                        onChange={(e) => setInput(e.target.value)}/>
                        <div onClick={handleSearch}>
                            <BsSearch className="chat-home-icons svgs-black" />
                        </div>
                    </div>
                    {usersDataLoading && <div className="aU-loading">
                        <LoadingSpinner width={'30px'} height={'30px'} />
                    </div>}
                    {!usersDataLoading && <div className="aU-main">
                        {(usersData.targetUsers||[])?.length > 0 && 
                            usersData.targetUsers.map((val, idx) => (
                                <div className="aU-li" key={`aU-${idx}`} 
                                onClick={() => startChat(val)}>
                                    <img src={val?.img||defaultImage} alt="" />
                                    <div className="aU-txt">
                                        <h2>{val.phoneNumber}</h2>
                                        <span>{val?.userName||val.about}</span>
                                    </div>
                                </div>
                            ))
                        }
                        {((usersData?.plainUsers||[]).length > 0) && <h3>Suggested accounts</h3>}
                        {(usersData?.plainUsers||[]).map((val, idx) => (
                            <div className="aU-li" key={`aU-${idx}`} 
                            onClick={() => startChat(val)}>
                                <img src={val?.img||defaultImage} alt="" />
                                <div className="aU-txt">
                                    <h2>{val.phoneNumber}</h2>
                                    <span>{val?.userName||val.about}</span>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            </Modal>}
        </div>
    )
}

export default Chats;