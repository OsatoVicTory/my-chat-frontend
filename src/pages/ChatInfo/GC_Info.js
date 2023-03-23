import React, { useState, useRef, useEffect } from "react";
import "./Index.css";
// import SVGs from "../../svgs/SVGs";
import { BiLeftArrowAlt, BiMessageDetail } from "react-icons/bi";
import { AiOutlineClose, AiFillLike, AiFillEdit } from "react-icons/ai";
import { BsCheckCircle, BsShareFill } from "react-icons/bs";
import defaultImage from "../../svgs/avatar.png";
import Modal from "../../components/Modal/Modal";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
    fetchGroupAccount, leaveGroup, addUserToGroup,
    fetchGroupChatImagesAndParticipants, makeAdmin,
    updateDescription
} from "../../services/groups";
import { saveContact } from "../../services/user";
import { formatTimeInDateForm } from "../../utils/formatters";
import { useSelector, useDispatch } from "react-redux";
import useScrollDetector from "../../hooks/useScrollDetector";
import LoadingSpinner from "../../components/loading/loading";
// import VideoPreview from "../../components/videoPreview/videoPreview";
import ViewParticipants from "./viewParticipants";
import { bindActionCreators } from "redux";
import { groupChatsActions, statusMessageActions, userActions, mediaActions } from "../../state";
import ErrorPage from "../../components/error/error";
import OptimizedImage from "../../components/OptimizedImage";
import Contacts from "../../components/contacts/contacts";

const GC_Info = ({ socket }) => {
    const { groups, user } = useSelector(state => state);
    const [makeFixed, setMakeFixed] = useState(false);
    const [route, setRoute] = useState("info");
    const navigate = useNavigate();
    const { id } = useParams();
    const { lstPage } = useSearchParams();
    const dispatch = useDispatch();
    const [profile, setProfile] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const refEle = useRef(null);
    const { setUserData } = bindActionCreators(userActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
    const { contactsData } = user;
    const [descriptionData, setDescriptionData] = useState(null);
    const [showDescriptionEdit, setShowDescriptionEdit] = useState(false);
    const [description, setDescription] = useState({img: profile?.img});
    const [addParticipants, setAddParticipants] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [participant, setParticipant] = useState({});
    const [saveContactLoading, setSaveContactLoading] = useState(false);
    const [invite, setInvite] = useState(false);
    const [error, setError] = useState(false);
    
    const { setMediaData } = bindActionCreators(mediaActions, dispatch);

    const navigateToMedia = (idx) => {
        setMediaData(images);
        navigate(`/app/media/images/${idx}`);
    };

    useEffect(() => {
        const group = groups.find(g => g.account._id == id);
        if(group) {
            setProfile(group.account);
            setImages(group.account.Images);
            setParticipants(group.account.participants);
            setLoading(false);
            setProfileLoading(false);
        } else {
            fetchGroupAccount(id)
                .then(res => {
                    setProfile(res.data.account);
                    setProfileLoading(false);
                })
                .catch(err => {
                    setError(true);
                    setProfileLoading(false);
                    setStatusMessage({type:'error',text:'Network error. Reload the page'})
                })
        }
        return;

        fetchGroupChatImagesAndParticipants(id)
            .then(res => {
                setImages(res.data.images);
                setParticipants(res.data.participants);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                setStatusMessage({type:'error',text:'Network error. Reload the page'})
            })

    }, []);

    const handleUpdateGroup = async (type) => {
        try {
            if(updateLoading) return;
            setUpdateLoading(true);
            let Data;
            if(type=="description") {
                let descriptionInfo = {...descriptionData, cloudinary_id: profile.cloudinary_id};
                if(!descriptionInfo?.img) descriptionInfo.img = profile.img;
                Data = await updateDescription(id, descriptionInfo);
            }
            else if(type=='makeAdmin') {
                Data = await makeAdmin(id, participant.userId);
                socket.emit('makeAdmin', {
                    groupdId: id, 
                    initiator: {userId: user._id,phoneNumber: user.phoneNumber},
                    initiated: {userId: participant._id, phoneNumber: participant.phoneNumber}
                })
            } else {
                Data = await addUserToGroup(id, [...selectedContacts.map(val => val.userId)]);
                socket.emit('addUsersToGroup', {
                    groupId: id,
                    initiator: {userId: user._id,phoneNumber: user.phoneNumber},
                    users: selectedContacts
                })
            }
            let newGroups = [...groups];
            for(var i=0;i<groups.length;i++) {
                if(groups[i].account._id == id) {
                    newGroups[i].account = Data.data.group;
                    break;
                }
            };
            setGroupChatsData(newGroups);
            setUpdateLoading(false);
            setStatusMessage({type:'success',text:'Group details updated successfully'});
            setDescription(false);
            setDescriptionData({});
            setAddParticipants(false);
            setParticipant({});
            
        } catch(err) {
            setStatusMessage({type:'error',text:'Network error. Try again'});
            setUpdateLoading(false);
        }
    }

    const handleSaveContact = () => {
        if(saveContactLoading) return;
        setSaveContactLoading(true);
        const data = [...user.contacts, {userId:participant.userId,userName:participant.userName}];
        saveContact(data)
            .then(res => {
                setStatusMessage({type:'success',text:'User added to your contacts'});
                setSaveContactLoading(false);
                let newUserData = {...user};
                newUserData.contacts = data;
                setUserData(newUserData);
                setParticipant({});
            })
            .catch(err => {
                setStatusMessage({type:'error',text:'Network error. Try again'});
                setSaveContactLoading(false);
            })
    }

    const handleLeaveGroup = () => {
        if(leaveLoading) return;
        setLeaveLoading(true);
        leaveGroup(id)
            .then(res => {
                setUserData({ groups: res.data.groups });
                if(groups.length > 0) setGroupChatsData(groups.filter(g => g.group._id == id));
                socket.emit('leaveGroup', { groupId: id, leaver: {userId: user._id,phoneNumber: user.phoneNumber} });
                setLeaveLoading(false);
            })
            .catch(err => {
                setLeaveLoading(false);
                if(groups.length > 0) setGroupChatsData(groups.filter(g => g.group._id == id));
            })
    }

    
    const detector = (res) => {
        if(res) setMakeFixed(true);
        else setMakeFixed(false);
    }

    useScrollDetector(refEle, 100, detector);

    return (
        <div className="ChatInfo">
            {profileLoading && <div className="ChatInfo__Loading">
                <LoadingSpinner width={"50px"} height={"50px"} />
                <h4>Loading</h4>
            </div>}
            {error && <ErrorPage />}
            {(!profileLoading && !error && route==="info") && <div className="ChatInfo__Wrapper" id="main">
                <div className={`cI__Top ${makeFixed}`}>
                    <div onClick={()=>navigate(lstPage||"/app/gc")}>
                        <BiLeftArrowAlt className="DM-info-icons svgs-white" />
                    </div>
                    <div>
                        {makeFixed && <div className="top__Fixed">
                            <img src={profile.img} alt="" />
                            <span>{profile.name}</span>
                        </div>}
                        {!makeFixed && ""}
                    </div>
                    {/* <div>{SVGs.ellipsis}</div> */}
                </div>
                <div className="cI__Main">
                    <div className="ciM__Img">
                        <img src={profile.img||defaultImage} alt="" />
                    </div>
                    <h1>{profile.name}</h1>
                    <p>Group ~ {profile.participants.length} participants</p>
                    <div className="ciM__IconsDiv">
                        <div className="ciM__Icons">
                            <div onClick={() => navigate(`/app/chats/gc/${id}`)}>
                                <BiMessageDetail className="DM-info-icons svgs-white" />
                                <span>Message</span>
                            </div>
                        </div>
                    </div>
                    <div className="full-width" onClick={()=>setShowDescriptionEdit(true)}>
                        <span className="pad">
                            {profile?.description||""}
                        </span>
                        <span className="grey pad">
                            Created on {formatTimeInDateForm(profile.createdAt||"Feb 28 2023")}
                        </span>
                        {profile.participants.find(p => p.userId == user._id)?.admin &&
                            <span className="grey pad" onClick={()=>setDescription(true)}>
                                Tap to update group account
                            </span>
                        }
                    </div>
                    <div className="full-width">
                        <div className="ciM__Media">
                            <span className="grey">Chat Images</span>
                            <div>
                                <div className="grey Loader">
                                    {loading ? 
                                        <LoadingSpinner width={'9px'} height={'9px'} /> :
                                        images.length
                                    }
                                </div>
                                {/* {SVGs.arrowLeft} */}
                            </div>
                        </div>
                        {images.length > 0 && <div className="media">
                            <ul>
                                {images.map((val, idx) => (
                                    <li key={`ciM-medi-${idx}`} onClick={() => navigateToMedia(idx)}>
                                        <div><OptimizedImage data={val.img} /></div>
                                    </li>
                                ))}
                            </ul>
                        </div>}
                        {(profile.participants.find(p => p.userId == user._id)?.admin && Contacts) && 
                            <div className="addParticipants" onClick={()=>setAddParticipants(true)}>
                                <img src={defaultImage} alt="" />
                                <span>Add Participant</span>
                            </div>
                        }
                        <div className="share-link" onClick={()=>setInvite(true)}>
                            <div className="share-img">
                                <BsShareFill className="DM-info-icons svgs-white" />
                            </div>
                            <span>Share Group Invite Link</span>
                        </div>
                        {participants.length > 0 && <ViewParticipants participants={participants} 
                        setRoute={setRoute} setParticipant={setParticipant} />}
                        <div className="ciM__Base">
                            <div className="pad" onClick={handleLeaveGroup}>
                                <AiFillLike className="DM-info-icons svgs-white" />
                                <span>Exit group</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            {invite && 
                <Contacts 
                closeModal={()=>setInvite(false)}
                openModal={invite} socket={socket}
                message={{link: `/app/chat/gc/${id}`, linkType: 'group'}}
                />
            }
            {showDescriptionEdit && <Modal closeModal={()=>setShowDescriptionEdit(false)}
            openModal={showDescriptionEdit} width={'250px'} text={"Edit group"}>
                <div className="desc">
                    <div className="desc-div">
                        <div className="desc-img-edit">
                            <img src={profile?.img||defaultImage} alt="" />
                            <label htmlFor="cG-input">
                                <AiFillEdit className="DM-info-icons svgs-white" />
                            </label>
                            <input type="file" id="cG-input" onChange={(e) => {
                                let File = e.target.files[0];
                                if(!['.png','.jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                                if(File.size > 3076) return setStatusMessage({type:'error', text:'File cannot be more than 3MB'})
                                setDescriptionData({...description, img: File});
                            }} />
                        </div>
                        <input name='description' placeholder={`${profile.description||'Enter Description'}`}
                        onChange={(e)=>setDescriptionData({...descriptionData,description: e.target.value})} />
                        {/* <div>{SVGs.emoji}</div> */}
                    </div>
                    {(descriptionData.description||descriptionData.img) && <div className="desc-button">
                        <div onClick={() => handleUpdateGroup('description')}>
                            {updateLoading ? 
                                <LoadingSpinner width={'10px'} height={'10px'} /> :
                                'Save'
                            }
                        </div>
                    </div>}
                </div>
            </Modal>}
            {addParticipants && <Modal closeModal={()=>setAddParticipants(false)}
            width={'250px'} openModal={addParticipants} text={"Add Participant(s)"}>
                <div className="AP">
                    <h2>Add Participants</h2>
                    {selectedContacts.length > 0 && 
                        <div className="AP-selected">
                            <div className="APS">
                                {selectedContacts.map((val, idx) => (
                                    <div className="APS-div" key={`APS-${idx}`}>
                                        <div className="APS-img">
                                            <img src={val.img||defaultImage} alt="" />
                                            <div><AiOutlineClose className="DM-info-icons svgs-black" /></div>
                                        </div>
                                        <span>{val.userName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    <div className={`AP-lists ${selectedContacts.length > 0 ? '':'full'}`}>
                        {contactsData.map((val, idx) => (
                            <div className="AP-li" key={`AP-li-${idx}`} onClick={() => {
                                if(profile.participants.find(p => p.userId == val.userId)) {
                                    return setStatusMessage({type:'error',text:'User already a participant of this group'})
                                }
                                if(!selectedContacts.find(s => s.userId == val.userId)) {
                                    setSelectedContacts([...selectedContacts, val])
                                }
                            }}>
                                <img src={val.img} alt="" />
                                <span>{val.userName}</span>
                                {selectedContacts.find(s => s.userId == val.userId) && 
                                    <div className="AP-select">
                                        <BsCheckCircle className="DM-info-icons svgs-white" />
                                    </div>
                                }
                            </div>
                        ))}
                    </div>
                    {selectedContacts.length > 0 && <div className="AP-button">
                        <div onClick={() => handleUpdateGroup('participants')}>
                            {updateLoading ? 'Update' : <LoadingSpinner width={'15px'} height={'15px'} />}
                        </div>
                    </div>}
                </div>
            </Modal>}
            {participant.phoneNumber && <Modal width={'250px'} text={"Save contact"}
            closeModal={()=>setParticipant({})} openModal={participant.phoneNumber}>
                <div className="Participant-div">
                    <div onClick={handleSaveContact}>
                        <input placeholder="Enter name to save to contact" 
                        onChange={(e)=>setParticipant({...participant, userName: e.target.value})}/>
                        <div className="pD-button">
                            {saveContactLoading ?
                                <LoadingSpinner width={'10px'} height={'10px'} /> :
                                "Save"
                            }
                        </div>
                    </div>
                    {profile.participants.find(p => p.userId == user._id)?.admin &&
                        <div onClick={()=>handleUpdateGroup('makeAdmin')} className="makeAdmin">
                            <span>Make Admin</span>
                            {updateLoading && <LoadingSpinner width={'10px'} height={'10px'} />}
                        </div>
                    }
                </div>
            </Modal>}
            {route==="participants" && 
                <ViewParticipants participants={participants} full={true} 
                setRoute={setRoute} setParticipant={setParticipant} />
            }
        </div>
    )
}

export default GC_Info;