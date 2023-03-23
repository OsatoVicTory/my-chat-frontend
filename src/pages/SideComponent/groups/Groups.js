import React, { useEffect, useState, useRef } from "react";
import "./Groups.css";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/loading/loading";
import { getAllGroupMessages, createNewGroup } from "../../../services/groups.js";
import { getContactsImages } from "../../../services/user";
import { useSelector, useDispatch } from 'react-redux';
import { groupChatsActions, statusMessageActions, loadedStateActions } from "../../../state";
import { bindActionCreators } from "redux";
// import SVGs from "../../../svgs/SVGs";
import defaultImage from "../../../svgs/avatar.png";
import { formatToTimeAndDate, formatMessageTime } from "../../../utils/formatters";
import ErrorPage from "../../../components/error/error";
import Emoji from "../../../components/Emoji";
import Modal from "../../../components/Modal/Modal";
import { getFakeGroups } from "../../../utils/routings";
import { BsCameraVideoFill, BsCardImage, BsEmojiSmile, BsCheckCircle } from "react-icons/bs";
import { AiFillEdit, AiOutlineClose, AiOutlinePlus } from "react-icons/ai";

const Groups = ({ socket }) => {

    const groupChatsData = useSelector(state => state.groups);
    const { loadedState, user, chats } = useSelector(state => state);
    const dispatch = useDispatch();
    const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setLoadedState } = bindActionCreators(loadedStateActions, dispatch);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState((!loadedState?.groups && !error) ? true : false);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [contactsImages, setContactsImages] = useState([]);
    const [createGroup, setCreateGroup] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const navigate = useNavigate();
    const [input, setInput] = useState({
        img: null, name: null, description: null
    });
    const [showEmoji, setShowEmoji] = useState({first: false, sec: false});
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);
    const inputRef2 = useRef(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    const amongSelected = (val) => {
        return selectedContacts.find(s => s.userId == val.userId)?.userId;
    }

    useEffect(() => {
        if(!loadedState?.groups) {
            if(loading && !error) {
                // setGroupChatsData(getFakeGroups());
                // setLoading(false);
                // setLoadedState({ groups: true });

                // uncomment
                getAllGroupMessages()
                    .then(res => {
                        setGroupChatsData(res.data.messages);
                        setLoadedState({groups:true});
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({...input, [name]: value});
    }

    useEffect(() => {   
        if(createGroup && !dataLoaded) {
            console.log("ran creategroup loading")
            setContactsLoading(true);
            setContactsImages(user.contactsData);
            setDataLoaded(true);
            setContactsLoading(false);

            //no need for this again cus user.contactsData already has contact images now
            // getContactsImages()
            //     .then(res => {
            //         setContactsImages(res.data.contacts);
            //         setDataLoaded(true);
            //         setContactsLoading(false);
            //     })
            //     .catch(err => {
            //         setContactsLoading(false);
            //         setStatusMessage({type: 'error',text: 'Network failure. Try again'})
            //         setCreateGroup(false);
            //     })
        }
    }, [createGroup, dataLoaded])

    const handleCreateGroup = () => {
        if(createLoading) return;
        setCreateLoading(true);
        const participants = [{userId: user._id,admin:true}, ...selectedContacts.map(val => ({userId: val.userId, admin: false}))];
        createNewGroup({...input, createdBy: user._id, participants})
            .then(res => {
                const newGroups = [
                    {account: {...res.data.group}, messagesData:[]}, 
                    ...groupChatsData
                ];
                setGroupChatsData(newGroups);
                setCreateLoading(false);
                setStatusMessage({type:'success',text:'Group created successfully'});
                navigate(`/app/chat/gc/${res.data.group._id}/${res.data.group.groupRefId}`);
            })
            .catch(err => {
                setCreateLoading(false);
                setStatusMessage({type:'error',text:'Network error. Try again.'})
            })
    }

    const Text = ({ val }) => {
        if(val?.images[0]?.img) {
            return (
                <div className="Text">
                    <BsCardImage className="group-home-icons" />
                    <span>{val.message||'Photo'}</span>
                </div>
            )
        } else {
            return (
                <div className="Text">
                    <span>{val.message}</span>
                </div>
            )
        }
    }

    return (
        <div className="Groups">
            {loading && <div className="GroupsLoading">
                <LoadingSpinner width={"60px"} height={"60px"} />
            </div>}
            {error && <ErrorPage />}
            {(!loading&&!error) && <ul className="GroupsLists">
                {groupChatsData.map((val, idx) => (
                    <li key={`Groups-${idx}`} 
                    onClick={() => navigate(`/app/chat/gc/${val.account._id}/${val.account.groupRefId}`)}>
                        <div className="Groups__Img">
                            <img src={val.account.img||defaultImage} />
                        </div>
                        <div className="GroupsDets">
                            <div className="Groups__Tops">
                                <div className="h3">{val.account.name}</div>
                                {val.messagesData.length > 0 && <div className="span">
                                    {formatMessageTime(val.messagesData[val.messagesData.length-1].createdAt)}
                                </div>}
                            </div>
                            {val.isTyping && <div className="Groups__Bottom">
                                <div className="span typing">{val.isTyping} typing...</div>
                            </div>}
                            {!val.isTyping && <div className="Groups__Bottom">
                                <div className="span">
                                    {val.messagesData.length > 0 ?
                                        <Text val={val.messagesData[val.messagesData.length-1]} /> :
                                        'Start Chat'
                                    }
                                </div>
                                {(!val.isRead && val.unreadMessages) && <div className="unreadMessages">
                                    <span>{val.unreadMessages}</span>
                                </div>}
                            </div>}
                        </div>
                    </li>
                ))}
            </ul>}
            <div className="statusAbsolutes">
                <div onClick={() => setCreateGroup(true)}
                className="wS__Edit">
                    <AiOutlinePlus className="group-home-icons" />
                </div>
            </div>
            {createGroup && <Modal openModal={createGroup} text={"Set up group"}
            closeModal={()=>setCreateGroup(false)} width={'270px'} height={"90%"}>
                <div className="createGroup">
                    {contactsLoading && <div className="cG-loading">
                        <LoadingSpinner width={'30px'} height={'30px'} />
                    </div>}
                    {!contactsLoading && <div className="cG-wrapper">
                        {/* <div className="cG-top">
                            <h2>Set up group</h2>
                            <div onClick={()=>setCreateGroup(false)}>
                                <AiOutlineClose className="group-home-icons svgs-black" />
                            </div>
                        </div> */}
                        <div className="cG-main">
                            <div className="cG-edits">
                                <div className="cG-img-edit">
                                    {input.img && <img src={input.img} alt="" />}
                                    {!input.img && <img src={defaultImage} alt="" />}
                                    <label htmlFor="cG-input">
                                        <AiFillEdit className="group-home-icons svgs-black" />
                                    </label>
                                    <input type="file" id="cG-input" onChange={(e) => {
                                        let File = e.target.files[0];
                                        if(!['png','jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                                        if(File.size > 3076076) return setStatusMessage({type:'error', text:'File cannot be more than 3MB'})
                                        setInput({...input, img: File});
                                    }} />
                                </div>
                                <div className="cGE-input">
                                    <div className="cGE-inputers">
                                        <input onChange={handleChange} name="name" onBlur={()=>setCursorPosition(0)}
                                        placeholder="Enter group name" ref={inputRef} onFocus={() => null}/>
                                        <div className="cGE-inputers-emoji"
                                        onClick={()=>setShowEmoji({sec: false, first: !showEmoji.first})}>
                                            <BsEmojiSmile className="group-home-icons svgs-black" />
                                        </div>
                                        {showEmoji.first && <div className="cGE-emoji">
                                            <Emoji 
                                            message={input}
                                            setMessage={setInput}
                                            refCurrent={inputRef.current}
                                            key={'name'}
                                            cursorPosition={cursorPosition}
                                            setCursorPosition={setCursorPosition}
                                            />
                                        </div>}
                                    </div>
                                </div>
                                    
                            </div>
                            <div className="cGE-inputers descrip">
                                <input onChange={handleChange} name="description" onBlur={()=>setCursorPosition(0)}
                                placeholder="Enter group description" ref={inputRef2} onFocus={()=>null} />
                                <div className="cGE-inputers-emoji" 
                                onClick={()=>setShowEmoji({first: false, sec: !showEmoji.sec})}>
                                    <BsEmojiSmile className="group-home-icons svgs-black" />
                                </div>
                                {showEmoji.sec && <div className="cGE-emoji">
                                    <Emoji 
                                    message={input}
                                    setMessage={setInput}
                                    key={'description'}
                                    refCurrent={inputRef2.current}
                                    cursorPosition={cursorPosition}
                                    setCursorPosition={setCursorPosition}
                                    />
                                </div>}
                            </div>
                            {selectedContacts.length > 0 && 
                                <div className="cG-selected">
                                    <div className="cGS">
                                        {selectedContacts.map((val, idx) => (
                                            <div className="cGS-div" key={`cGS-${idx}`}>
                                                <div className="cGS-img">
                                                    <img src={val.img||defaultImage} alt="" />
                                                    <div><AiOutlineClose className="group-home-icons svgs-black" /></div>
                                                </div>
                                                <span>{val.userName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                            <div className={`cG-lists ${selectedContacts.length > 0 ? '':'full'}`}>
                                {contactsImages.map((val, idx) => (
                                    <div className="cG-li" key={`cG-li-${idx}`} onClick={() => {
                                        if(!selectedContacts.find(s => s.userId == val.userId)) {
                                            setSelectedContacts([...selectedContacts, val]);
                                        }
                                    }}>
                                        <img src={val.img} alt="" />
                                        <span>{val.userName}</span>
                                        {amongSelected(val) && 
                                            <div className="cG-select">
                                                <BsCheckCircle className="group-home-icons svgs-black" />
                                            </div>
                                        }
                                    </div>
                                ))}
                            </div>
                            {selectedContacts.length > 0 && <div className="cG-button">
                                <div onClick={handleCreateGroup}>
                                    {!createLoading ? 'Create' : <LoadingSpinner width={'15px'} height={'15px'} />}
                                </div>
                            </div>}
                        </div>
                    </div>}
                </div>
            </Modal>}
        </div>
    )
}

export default Groups;