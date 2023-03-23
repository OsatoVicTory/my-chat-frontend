import React, { useState, useRef } from "react";
import "./Profile.css";
import defaultImage from "../../svgs/avatar.png";
// import SVGs from "../../svgs/SVGs";
import { useNavigate } from "react-router-dom";
import { updateUserAccount } from "../../services/user";
import LoadingSpinner from "../../components/loading/loading";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { statusMessageActions, userActions } from "../../state/index";
import useClickOutside from "../../hooks/useClickOutside";
import Emoji from "../../components/Emoji";
import Modal from "../../components/Modal/Modal";
import { AiFillEdit, AiFillLike, AiOutlinePlus } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { BiLeftArrowAlt } from "react-icons/bi";

const Profile = ({ socket }) => {

    const [showBase, setShowBase] = useState(null);
    const user = useSelector(state => state.user);
    const [img, setImg] = useState(null);
    const [input, setInput] = useState(user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { setUserData } = bindActionCreators(userActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const baseRef = useRef(null);
    const inputRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [showEmoji, setShowEmoji] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [showPic, setShowPic] = useState(false);

    useClickOutside(baseRef, () => setShowBase(null));

    const handleChange = (e) => {
        const { value, name } = e.target;
        setInput({...input, [name]: value});
    }

    const handleSave = (type = null) => {
        if(saveLoading) return;
        setSaveLoading(true);
        let inputInfo = {cloudinary_id: user.cloudinary_id};
        if(!type) inputInfo = {...input};
        if(img) inputInfo.img = img;
        updateUserAccount(inputInfo)
            .then(res => {
                setUserData(res.data.user);
                socket.emit('updateMyAccount', {...inputInfo, ...res.data.user});
                setStatusMessage({type:'success',text:'Successfully updated profile'});
                setSaveLoading(false);
            })
            .catch(err => {
                setStatusMessage({type:'error',text:'Network error. Try again'});
                setSaveLoading(false);
            })
    }

    const handleCancel = () => {
        setInput(user);
        setShowBase(null);
    };

    return (
        <div className="Profile">
            <div className="Profile__Wrapper">
                <div className="profile__Top">
                    <div onClick={()=>navigate("/app/chats")}>
                        <BiLeftArrowAlt className="profile-icons" />
                    </div>
                    <h3>Profile</h3>
                </div>
                <div className="profile__Pic">
                    <div className="profile__Img">
                        <img src={user.img||defaultImage} alt="" />
                        <div className="profile__Edit">
                            <label htmlFor="input">
                                <AiFillEdit className="profile-icons" />
                            </label>
                            <input type="file" id="input"
                            onChange={(e) => {
                                const File = e.target.files[0];
                                if(!['png','jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                                if(File.size > 3080) return setStatusMessage({type:'error', text:'File cannot be more than 3MB'})
                                setImg(File);
                                setShowPic(true);
                            }}/>
                        </div>
                    </div>
                </div>
                <div className="profile__Main">
                    <div className="pM__Div" onClick={() => setShowBase("userName")}>
                        {/* <div className="pM__Icons">
                            <AiOutlinePlus className="profile-icons" />
                        </div> */}
                        <div className="pM__Texts">
                            <span>Name</span>
                            <h3>{user.userName}</h3>
                        </div>
                        <div className="pM__Icons">
                            <AiOutlinePlus className="profile-icons" />
                        </div>
                    </div>
                    <div className="pM__Div" onClick={() => setShowBase("about")}>
                        {/* <div className="pM__Icons">{SVGs.like}</div> */}
                        <div className="pM__Texts">
                            <span>About</span>
                            <h3>{user.about}</h3>
                        </div>
                        <div className="pM__Icons">
                            <AiOutlinePlus className="profile-icons" />
                        </div>
                    </div>
                    <div className="pM__Div" onClick={() => setShowBase("phoneNumber")}>
                        {/* <div className="pM__Icons">{SVGs.like}</div> */}
                        <div className="pM__Texts">
                            <span>Phone</span>
                            <h3>{user.phoneNumber}</h3>
                        </div>
                        <div className="pM__Icons">
                            <AiOutlinePlus className="profile-icons" />
                        </div>
                    </div>
                </div>
                
            </div>
            {showBase && <div className="pM__Base" ref={baseRef}>
                <div className="pM__Base__Wrapper">
                    <span>{`Enter ${showBase}`}</span>
                    <div className="pM-input">
                        <input name={showBase} type={showBase}
                            placeholder={`Enter ${showBase}`}
                            onChange={handleChange} ref={inputRef}
                            onBlur={()=>setCursorPosition(0)} onFocus={()=>null}
                        />
                        <div className="pM__Icons" onClick={()=>setShowEmoji(!showEmoji)}>
                            <BsEmojiSmile className="profile-icons" />
                        </div>
                        {showEmoji && <div className="pM-emoji">
                            <Emoji 
                            message={input}
                            setMessage={setInput}
                            key={showBase}
                            refCurrent={inputRef}
                            cursorPosition={cursorPosition}
                            setCursorPosition={setCursorPosition}
                            />
                        </div>}
                    </div>
                    <div className="pM-input-base">
                        <div className="base-div">
                            <div onClick={() => handleSave(null)}>
                                {saveLoading ? 
                                    <LoadingSpinner width={'10px'} height={'10px'} /> :
                                    'Save'
                                }
                            </div>
                            <div onClick={handleCancel} style={{marginLeft: "10px"}}>
                                {'Cancel'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            {showPic && <Modal openModal={showPic}
            closeModal={()=>setShowPic(false)} width={'200px'}>
                <div className="Full-Img">
                    <div className="FI-top">
                        <div onClick={() => setShowPic(false)}>
                            <BiLeftArrowAlt className="profile-icons" />
                        </div>
                        <span>Profile Image</span>
                        <div>
                            <label htmlFor="input">
                                <AiFillEdit className="profile-icons" />
                            </label>
                            <input type="file" id="input"
                            onChange={(e) => {
                                const File = e.target.files[0];
                                if(!['png','jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                                if(File.size > 3080) return setStatusMessage({type:'error', text:'File cannot be more than 3MB'})
                                setImg(File)
                            }}/>
                        </div>
                    </div>
                    <div className="FI-main">
                        {img && <img src={URL.creatObjectURL(img)} alt="" />}
                        {!img && <img src={user.img||defaultImage} alt="" />}
                    </div>
                    {img && <div className="FI-button" onClick={()=>handleSave("img")}>
                        {saveLoading ? 
                            <LoadingSpinner width={'10px'} height={'10px'} /> :
                            'Save'
                        }
                    </div>}
                </div>
            </Modal>}
        </div>
    );
}

export default Profile;