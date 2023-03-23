import React, { useRef, useEffect, useState } from "react";
import "./StatusView.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import SVGs from "../../svgs/SVGs";
import defaultImage from "../../svgs/avatar.png";
import useLongPress from "../../hooks/useLongPress";
import useSwipe from "../../hooks/useSwipe";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import LoadingSpinner from "../../components/loading/loading";
import { deleteStatus } from "../../services/status";
import { statusActions, statusMessageActions } from "../../state/index";
import { formatStatusTime, formatTimeInDateForm } from "../../utils/formatters";
import useClickOutside from "../../hooks/useClickOutside";
import { deletedMyStatus } from "../../utils/helpers";
import OptimizedImage from "../../components/OptimizedImage";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";

const MyStatus = ({ socket }) => {

    const navigate = useNavigate();
    const getQueryParams = (path) => {
        let obj = {};
        path.split("?")[1].split("&").map(key => { 
            let split = key.split("=");
            obj[split[0]] = split[1];
        })
        return obj;
    };

    const { index } = getQueryParams(window.location.href);
    const timeRef = useRef(0);
    const timerRef = useRef(null);
    const stopRef = useRef(false);
    const [timeVal, setTimeVal] = useState(0);
    // const [xPosition, setXPosition] = useState(0);
    const clickedRef = useRef(0);
    const viewersRef = useRef(null);

    const { status, user } = useSelector(state => state);
    const { contactsData } = user;
    const viewData = status['user'];
    const [curIdx, setCurIdx] = useState(0);
    const dispatch = useDispatch();
    const [statusViewers, setStatusViewers] = useState([]);
    const [showViewers, setShowViewers] = useState(false);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setStatusData } = bindActionCreators(statusActions, dispatch);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useClickOutside(viewersRef, () => setShowViewers(false));
    const getProgressWidth = (idx) => {
        if(curIdx > idx) return `100%`;
        else if(curIdx == idx) return `${((timeVal/6) * 100).toFixed(2)}%`;
        else return `0%`;
    };

    const contactName = (id) => contactsData.find(contact => contact.userId == id)?.userName;
    const findUserImage = (id) => contactsData.find(c => c.userId == id)?.img;

    useEffect(() => {
        if(showViewers) stopRef.current = true;
        else stopRef.current = false;
    }, [showViewers]);

    useEffect(() => {
        // if((index-0) && !curIdx) setCurIdx(index-0);
        if(!viewData || !viewData.statuses[curIdx]) return navigate("/app/status");
    }, [index, curIdx]);

    const handleDelete = () => {
        if(deleteLoading) return;
        setDeleteLoading(true);
        const id = viewData.statuses[curIdx]._id;
        deleteStatus(id)
            .then(res => {
                setDeleteLoading(false);
                setStatusMessage({type:'success',text:res.data.message});
                socket.emit('deleteStatus', { statusId: id, posterId: user._id });
                deletedMyStatus(id, status, setStatusData);
            })
            .catch(err => {
                setDeleteLoading(false);
                setStatusMessage({type:'error',text:'Failed to delete. Check internet and try again'});
            })
    }

    const switchIdx = (type, clicked) => {

        if(type==="left") {
            if(curIdx === 0) {
                if(timerRef.current) clearInterval(timerRef.current);
                navigate(`/app/status`);
                         
            } else {
                setCurIdx(curIdx-1);
            }
        } else {
            if(curIdx + 1 >= viewData?.statuses?.length) {
                if(timerRef.current) clearInterval(timerRef.current);
                navigate(`/app/status`);
                  
            } else {
                setCurIdx(curIdx+1);
            }
        };

        timeRef.current = 0;
        setTimeVal(0);
    };

    useEffect(() => {
        setStatusViewers(viewData.statuses[curIdx].viewers);

        if(timerRef.current) clearInterval(timerRef.current);

        timeRef.current = 0;
        setTimeVal(timeRef.current);
        timerRef.current = setInterval(() => {
            if(!stopRef.current) timeRef.current++;
            if(timeRef.current === 7) switchIdx("right", null);
            setTimeVal(timeRef.current);
        }, 1000);

        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        }

    }, [curIdx]);

    const leftSwipe = () => {
        //to go to next page on status
        //swipe go like this direction ( to here <--- from here )
        //like towards leftend swipe so start > end touch and
        //this effect in useSwipe hook is for leftSwipe func
        switchIdx("right", null);
    };
    const rightSwipe = () => {
        //to go to prev page on status
        //swipe go like this direction ( from here ---> to here )
        //like towards right end swipe so start < end touch and
        //this effect in useSwipe hook is for rightSwipe func
        switchIdx("left", null);
    };
    const handleClick = () => {
        stopRef.current = false;
    };
    const handleLongPress = () => {
        stopRef.current = true;
    };

    const nullReturn = () => null;
    const swipeEvents = useSwipe(leftSwipe, rightSwipe, 40, nullReturn, nullReturn);
    const pressEvents = useLongPress(handleClick, handleLongPress, 500);

    const svComponents = {
        image: (val) => <OptimizedImage data={val} />,
        text: (val) => <h2>{val}</h2>
    }

    const getWidths = (len, space) => {
        return `calc(${(100/len).toFixed(2)}% - ${len*space}px)`;
    }

    return (
        <div className="SV">
          {(viewData && viewData.statuses[curIdx]) && <div className="SV__Container"
          style={{width: `${viewData.statuses.length * 100}%`}}>
            <div className="SV__Wrapper" key={`SV-${index}`}
            style={{width: getWidths(viewData.statuses.length, 0)}}>
                <div className="SV__Top">
                    <div className="reels__Trail">
                        {viewData.statuses.map((val, idx) => (
                            <div className="Reel" key={`reel-${idx}`} 
                            style={{width: getWidths(viewData.statuses.length, 3)}}>
                                <div style={{width: getProgressWidth(idx)}}></div>
                            </div>
                        ))}
                    </div>
                    <div className="SV__User">
                        <div onClick={() => navigate('/app/status')}>
                            <BiLeftArrowAlt className="status-icons" />
                        </div>
                        <div>
                            <div className="sv__Img"><img src={viewData.account?.img||defaultImage} alt="" /></div>
                            <div className="sV__Txt">
                                <span className="big">{user.firstName}</span>
                                <span className="small">{formatTimeInDateForm(viewData.statuses[curIdx]?.createdAt)}</span>
                            </div>
                        </div>
                        <div onClick={handleDelete}>
                            {!deleteLoading ? 
                                <AiFillDelete className="status-icons" /> : 
                                <LoadingSpinner width={'15px'} height={'15px'} />
                            }
                        </div>
                    </div>
                </div>
                <div className="SV__Main">
                    <div className="sV__Content" {...swipeEvents}>
                        <div className="svAbsolutes left"
                        onClick={() => switchIdx("left")}>
                            <div><BiLeftArrowAlt className="status-icons" /></div>
                        </div>
                        <div className="sv__Media" {...pressEvents}
                        style={{backgroundColor: viewData.statuses[curIdx]?.background||'rgba(27,27,27,0.35'}}>
                            {svComponents['image'](viewData.statuses[curIdx].statusValue)}
                        </div>
                        <div className="svAbsolutes right"
                        onClick={() => switchIdx("right", true)}>
                            <div><BiRightArrowAlt className="status-icons" /></div>
                        </div>
                    </div>
                </div>
                {!showViewers && <div className="MyStatus__Viewers">
                    <div className="numViews" onClick={()=>setShowViewers(true)}>
                        {statusViewers.length} viewers
                    </div>
                </div>}
            </div>
            {showViewers && <div className="showViewers" ref={viewersRef}>
                <div className="sV-top">Viewers</div>
                <ul>
                    {statusViewers.map((val, idx) => (
                        <li className="sV-li" key={`sV-idx-${idx}`}>
                            <div className="sV-img">
                                <img src={findUserImage(val.userId)||defaultImage} alt="" />
                            </div>
                            <div className="sV-txts">
                                <h3>{contactName(val.userId)||""}</h3>
                                <span>{formatStatusTime(val.time)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>}
          </div>}
        </div>
    )
}

export default MyStatus;