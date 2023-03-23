import React, { useState, useEffect } from "react";
import "./StatusHome.css";
import defaultImg from "../../../svgs/avatar.png";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { 
    statusActions, statusMessageActions, 
    userActions, loadedStateActions,
    statusUploadImageActions 
} from "../../../state/index";
import LoadingSpinner from "../../../components/loading/loading";
import { getAllStatus } from "../../../services/status";
import { whoCanViewMyStatus } from "../../../services/user";
import { formatStatusTime } from "../../../utils/formatters";
import ErrorPage from "../../../components/error/error";
import Image from "../../../components/image/image";
import { getFakeStatus } from "../../../utils/routings";
import { AiFillEdit, AiOutlinePlus } from "react-icons/ai";
import { BsCardImage, BsSearch } from "react-icons/bs";
import { BiCheckCircle, BiLeftArrowAlt } from "react-icons/bi";

const StatusHome = ({ statusPrivacy, setStatusPrivacy, socket }) => {

    const [error, setError] = useState(false);
    const [statusSearch, setStatusSearch] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const { chats, status, loadedState } = useSelector(state => state);
    const [loading, setLoading] = useState((!loadedState?.status && !error) ? true : false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [saveLoading, setSaveLoading] = useState(false);
    const { setUserData } = bindActionCreators(userActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setStatusData } = bindActionCreators(statusActions, dispatch);
    const { setLoadedState } = bindActionCreators(loadedStateActions, dispatch);
    const { setStatusUploadImageData } = bindActionCreators(statusUploadImageActions, dispatch);
    const { contacts, img, _id, refId, whoSeesMyStatus, contactsData } = useSelector(state => state.user);
    const [showContacts, setShowContacts] = useState(contactsData);

    const handleSave = () => {
        if(saveLoading) return;
        setSaveLoading(true);
        let newWhoSeesMyStatus = [];
        if(statusPrivacy == "Show") newWhoSeesMyStatus = selectedContacts;
        else {
            for(var i=0;i<contacts.length;i++) {
                if(!selectedContacts.includes(contacts[i].userId)) {
                    newWhoSeesMyStatus.push(contacts[i].userId);
                }
            }
        }

        whoCanViewMyStatus(newWhoSeesMyStatus)
            .then(res => {
                setSaveLoading(false);
                setStatusPrivacy(null);
                setSelectedContacts([]);
                setUserData({ whoSeesMyStatus: newWhoSeesMyStatus });
            })
            .catch(err => {
                setSaveLoading(false);
                setStatusMessage({type:'error',text:'Network error. Failed to update database, try again'});
            })
    }

    useEffect(() => {
        if(statusPrivacy==="Hide") {
            const dataSet = contactsData.filter(c => !whoSeesMyStatus.includes(c.userId)).map(v => v.userId);
            setSelectedContacts(dataSet);
        }
    }, [statusPrivacy])

    useEffect(() => {

        if(!loadedState?.status) {
            if(loading && !error) {
                // setStatusData(getFakeStatus());
                // setLoadedState({ status: true });
                // setLoading(false);

                // uncomment
                getAllStatus()
                    .then(res => {
                        console.log(res.data);
                        setStatusData(res.data.statuses);
                        setLoadedState({ status: true });
                        setLoading(false);
                    })
                    .catch(err => {
                        setStatusMessage({type:'error',text: 'Network error. Reload page'});
                        setLoading(false);
                        setError(true);
                    })
            };
        } 

    }, []);

    return (
        <div className='SH'>
            {loading && <div className="SH__Loading">
                <LoadingSpinner width={"30px"} height={"30px"} />
            </div>}
            {error && <ErrorPage />}
            {(!loading&&!error) && <div className="SH__Wrapper">
                {status?.user?.statuses?.length === 0 && <div className="SH__Top" htmlFor="statusUpload">
                    <div className="shT__Img">
                        <img src={img||defaultImg} alt="" />
                        <div><AiOutlinePlus className="status-home-icons" /></div>
                    </div>
                    <div className="sH__Txt">
                        <span className="big">My Status</span>
                        <span className="small">Tap to add status update</span>
                    </div>
                    <input type="file" style={{display:'none'}} id="statusUpload"
                    onChange={(e) => {
                        const File = e.target.files[0];
                        if(!['png','jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                        if(File.size > 3076076) return setStatusMessage({type:'error', text:'File cannot be more than 3MB'})
                        setStatusUploadImageData({...File});
                        navigate("/app/status/create/upload-img");
                    }}/>
                </div>}
                {status?.user?.statuses?.length > 0 && <div className="SH__Top"
                onClick={() => navigate('/app/status/view-my-status?index=0')}>
                    <div className="status__Img">
                        {/* <img src={val.img} alt="" /> */}
                        <Image isStatus={true} viewed={status.user.statuses.length}
                        len={status.user.statuses.length} 
                        data={status.user.statuses[status.user.statuses.length-1]} />
                    </div>
                    <div className="sH__Txt">
                        <span className="big">{'You'}</span>
                        <span className="small">{formatStatusTime(status.user.statuses[status.user.statuses.length-1].createdAt)}</span>
                    </div>
                </div>}
                <div className="SH__Main">
                    <div>
                        <span className="small">Recent updates</span>
                        <ul>
                            {[...status.recentUpdates].map((val,idx) => (
                                <li key={`status-${idx}`} className="status__List"
                                onClick={() => navigate(`/app/status/view-status?startId=${val.account._id}&type=recentUpdates&startFrom=${val?.viewed||0}&startPage=${idx}`)}>
                                    <div className="status__Img">
                                        {/* <img src={val.img} alt="" /> */}
                                        <Image isStatus={true} viewed={val.viewed}
                                        len={val.statuses.length} all={false}
                                        data={val.statuses[val.statuses.length-1]} 
                                        />
                                    </div>
                                    <div className="sH__Txt">
                                        <span className="big">{val.userName}</span>
                                        <span className="small">{formatStatusTime(val.statuses[val.statuses.length-1].createdAt)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div><div>
                        <span className="small">Viewed updates</span>
                        <ul>
                            {[...status?.viewedUpdates].map((val,idx) => (
                                <li key={`status-${idx}`} className="status__List"
                                onClick={() => navigate(`/app/status/view-status?startId=${val.account._id}&type=viewedUpdates&startFrom=${val?.viewed||0}&startPage=${idx}`)}>
                                    <div className="status__Img">
                                        {/* <img src={val.img} alt="" /> */}
                                        <Image isStatus={true} all={true}
                                        len={val.statuses.length} viewed={val.statuses.length}
                                        data={val.statuses[val.statuses.length-1]} 
                                        />
                                    </div>
                                    <div className="sH__Txt">
                                        <span className="big">{val.userName}</span>
                                        <span className="small">{formatStatusTime(val.statuses[val.statuses.length-1].createdAt)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>}
            <div className="statusAbsolutes">
                <div onClick={() => navigate("/app/status/create/write")}
                className="wS__Edit"><AiFillEdit className="status-home-icons" /></div>
                <div>
                    <label htmlFor="input-status">
                        <BsCardImage className="status-home-icons" />
                    </label>
                    <input id="input-status" type="file" 
                    onChange={(e) => {
                        // console.log(e.target.files[0]);
                        const File = e.target.files[0];
                        if(!['png','jpg','jpeg'].find(file => File.name.endsWith(file))) return setStatusMessage({type:'error',text:'Upload only image files'});
                        if(File.size > 3076076) return setStatusMessage({type:'error', text:'File cannot be more than 3MB'})
                        
                        setStatusUploadImageData(e.target.files[0]);
                        navigate("/app/status/create/upload-img");
                    }}/>
                </div>
            </div>
            {statusPrivacy && <div className="statusPrivacy">
                {statusPrivacy==="intro" && <div className="sP__Wrapper">
                    <div className="sP__Top">
                        <div className="sP__Icons"
                        onClick={() => {
                            setStatusPrivacy(false);
                            setSelectedContacts([]);
                        }}><BiLeftArrowAlt className="status-home-icons" /></div>
                        <h2>Set up Your Status Privacy</h2>
                    </div>
                    <h3>Who can see my status updates</h3>
                    <ul>
                        <li className="sP__List">
                            <div className={`sP__Picker`}><div></div></div>
                            <span>My contacts</span>
                        </li>
                        <li className="sP__List" onClick={() => setStatusPrivacy("Hide")}>
                            <div className={`sP__Picker`}><div></div></div>
                            <span>My contacts except...</span>
                        </li>
                        <li className="sP__List" onClick={() => setStatusPrivacy("Show")}>
                            <div className={`sP__Picker`}><div></div></div>
                            <span>Only Share with ...</span>
                        </li>
                    </ul>
                </div>}
                {statusPrivacy!=="intro" && <div className="sP__Wrapper">
                    {!statusSearch && <div className="sP__Top">
                        <div className="sP__Icons"
                        onClick={() => {
                            setStatusPrivacy("intro");
                            setSelectedContacts([]);
                        }}><BiLeftArrowAlt className="status-home-icons" /></div>
                        <div className="txts">
                            <span className="nowrap-txts">{statusPrivacy} status from ...</span>
                            <span className="nowrap-txts"
                            style={{fontSize: "12px", marginTop:"3px"}}
                            >{selectedContacts.length} {selectedContacts.length>1?"contacts":"contact"} selected</span>
                        </div>
                        <div className="sP__Icons"
                        onClick={() => setStatusSearch(true)}>
                            <BsSearch className="status-home-icons" />
                        </div>
                        <div className="sP__Icons">
                            <BiCheckCircle className="status-home-icons" />
                        </div>
                    </div>}
                    {statusSearch && <div className="sP__Top">
                        <div className="sP__Icons"
                        onClick={() => setStatusSearch(false)}>
                            <BiLeftArrowAlt className="status-home-icons" />
                        </div>
                        <input placeholder="Search" onChange={(e) => {
                            const { value } = e.target;
                            setShowContacts([...contacts.filter(contact => (contact.userName == value||contacts.phoneNumber==value))])
                        }} />
                    </div>}
                    <ul>
                        {showContacts.map((val,idx) => (
                            <li className="sP__Contact__List" key={`contacts-${idx}`}
                            onClick={() => {
                                if(!selectedContacts.includes(val.userId)) setSelectedContacts([...selectedContacts, val.userId]);
                                else setSelectedContacts(prev => prev.filter(id => id !== val.userId));
                            }}>
                                <img src={val.img} alt="" />
                                <span className="nowrap-txts">{val.userName}</span>
                                {(selectedContacts.includes(val.userId)) && 
                                    <div className={`sP__Icons ${statusPrivacy}`}>
                                        <BiCheckCircle className="status-home-icons" />
                                    </div>                                   
                                }
                            </li>
                        ))}
                    </ul>
                    <div className="sP__Save" onClick={handleSave}>
                        {!saveLoading ? 
                            <BiCheckCircle className="status-home-icons" /> : 
                            <LoadingSpinner width={'15px'} height={'15px'} />
                        }
                    </div>
                </div>}
            </div>}
        </div>
    )
}

export default StatusHome;