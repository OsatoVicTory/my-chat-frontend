import React, { useState, useRef, useEffect } from "react";
import "./Index.css";
// import SVGs from "../../svgs/SVGs";
import { BiLeftArrowAlt, BiMessageDetail } from "react-icons/bi";
import { IoMdCall } from "react-icons/io";
import { BsCameraVideoFill } from 'react-icons/bs';
import { FaEllipsisV } from "react-icons/fa";
import defaultImage from "../../svgs/avatar.png";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { mediaActions, statusMessageActions } from "../../state";
import { formatTimeInDateForm, formatLastSeenTime } from "../../utils/formatters";
import { fetchUserAccount, fetchChatImages } from "../../services/chats";
import LoadingSpinner from "../../components/loading/loading";
import ErrorPage from "../../components/error/error";
// import VideoPreview from "../../components/videoPreview/videoPreview";
import useScrollDetector from "../../hooks/useScrollDetector";
import OptimizedImage from "../../components/OptimizedImage";

const DM_Info = () => {
    
    const { chats } = useSelector(state => state);
    const { id } = useParams();
    const navigate = useNavigate();
    const { lstPage } = useSearchParams();
    const [makeFixed, setMakeFixed] = useState(false);
    const [profile, setProfile] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [error, setError] = useState(false);
    const refEle = useRef(null);

    const dispatch = useDispatch();
    const { setMediaData } = bindActionCreators(mediaActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);

    const navigateToMedia = (idx) => {
        setMediaData(images);
        navigate(`/app/media/images/${idx}`);
    };

    useEffect(() => {
        const acct = chats.find(c => c.account._id == id)?.account;
        // uncomment
        // setImagesLoading(true);
        if(!acct) {
            fetchUserAccount(id)
                .then(res => {
                    setProfile(res.data.account);
                    setProfileLoading(false);
                })
                .catch(err => {
                    setProfileLoading(false);
                    setStatusMessage({type:'error',text:'Network error'});
                    setError(true);
                })
        } else {
            setProfile(acct);
            setProfileLoading(false);
        }
        //comment
        return;

        fetchChatImages(id)
            .then(res => {
                setImages(res.data.images);
                setImagesLoading(false);
            })
            .catch(err => {
                setImagesLoading(false);
                setStatusMessage({type:'error',text:'Network error could not fetch images. Reload page'});
            })

    }, []);

    const detector = (res) => {
        if(res) setMakeFixed(true);
        else setMakeFixed(false);
    }

    useScrollDetector(refEle, 100, detector);

    return (
        <div className="ChatInfo">
            {profileLoading && <div className="ChatInfo__Loading">
                <LoadingSpinner with={'40px'} height={'40px'} />
                <h4>Loading</h4>
            </div>}
            {error && <ErrorPage />}
            {(!profileLoading && !error) && <div className="ChatInfo__Wrapper" id="main">
                <div className="cI__Top">
                    <div onClick={()=>navigate(lstPage||'/app/chats')}>
                        <BiLeftArrowAlt className="DM-info-icons svgs-white" />
                    </div>
                    <div>
                        {makeFixed && <div className="top__Fixed">
                            <img src={profile?.img||defaultImage} alt="" />
                            <h2>Edward</h2>
                        </div>}
                        {!makeFixed && ""}
                    </div>
                    <div><FaEllipsisV className="DM-info-icons svgs-white" /></div>
                </div>
                <div className="cI__Main">
                    <div className="ciM__Img"><img src={profile?.img||defaultImage} alt="" /></div>
                    <h2>{profile.name}</h2>
                    <h1>{profile.phoneNumber}</h1>
                    <p>{formatLastSeenTime(profile.lastSeen)}</p>
                    <div className="ciM__IconsDiv">
                        <div className="ciM__Icons">
                            <div onClick={()=>navigate(`/app/chat/dm/${id}`)}>
                                <BiMessageDetail className="DM-info-icons svgs-white" />
                                <span>Message</span>
                            </div>
                            <div onClick={()=>navigate(`/app/call/audio/call/${id}`)}>
                                <IoMdCall className="DM-info-icons svgs-white" />
                                <span>Audio</span>
                            </div>
                            <div onClick={()=>navigate(`/app/call/video/call/${id}`)}>
                                <BsCameraVideoFill className="DM-info-icons svgs-white" />
                                <span>Video</span>
                            </div>
                        </div>
                    </div>
                    <div className="full-width">
                        <span className="pad">{profile.about}</span>
                        <span className="grey pad">
                            Last seen {formatTimeInDateForm(profile.aboutLastTime)}
                        </span>
                    </div>
                    <div className="full-width">
                        <div className="ciM__Media">
                            <span className="grey">Chat Images</span>
                            <div>
                                <div className="grey Loader">
                                    {imagesLoading ? 
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
                        {/* <div className="ciM__Base">
                            <div className="pad">
                                {SVGs.like}
                                <span>Block Edward</span>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default DM_Info;