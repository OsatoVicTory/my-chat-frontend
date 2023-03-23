import React, { useRef, useEffect, useState } from "react";
import "./StatusView.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import SVGs from "../../svgs/SVGs";
import defaultImage from "../../svgs/avatar.png";
import useLongPress from "../../hooks/useLongPress";
import useSwipe from "../../hooks/useSwipe";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { viewStatus } from "../../services/status";
import { statusActions, statusMessageActions } from "../../state/index";
import { formatStatusTime, formatTimeInDateForm } from "../../utils/formatters";
import { fireViewedUpdate, firePushToViewedUpdate } from "../../utils/helpers";
import Input from "../../components/Input/Input";
import useClickOutside from "../../hooks/useClickOutside";
import OptimizedImage from "../../components/OptimizedImage";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { FaEllipsisV } from "react-icons/fa";
import { AiOutlineArrowUp, AiOutlineClose } from "react-icons/ai";

const StatusView = ({ socket }) => {

    const navigate = useNavigate();
    //id is account._id of poster of this status
    //type is either 'recentUpdates' or 'viewedUpdates'
    //index is the index of the status in the poster statuses data
    // const { id } = useParams();
    const getQueryParams = (path) => {
        let obj = {};
        (path.split("?")[1]||"").split("&").map(key => { 
            let split = key.split("=");
            obj[split[0]] = split[1];
        })
        return obj;
    };

    const { type, startId, startFrom, startPage } = getQueryParams(window.location.href);
    const [startIndex, setStartIndex] = useState((startFrom-0)||0);
    const [curPage, setCurPage] = useState((startPage-0)||0);
    const [id, setId] = useState(startId);
    const timeRef = useRef(0);
    const timerRef = useRef(null);
    const stopRef = useRef(false);
    const [input, setInput] = useState(false);
    const [timeVal, setTimeVal] = useState(0);
    const [xPosition, setXPosition] = useState(0);
    const clickedRef = useRef(0);
    const statusInputRef = useRef(null);
    useClickOutside(statusInputRef, () => setInput(false));
    const { status, user } = useSelector(state => state);
    const [viewData, setViewData] = useState(null);
    const [curIdx, setCurIdx] = useState(0);
    const dispatch = useDispatch();
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setStatusData } = bindActionCreators(statusActions, dispatch);
    const [updatedIds, setUpdatedIds] = useState([]);

    const contactName = (acc) => {
        return user.contacts.find(u => u.userId == acc._id)?.userName||acc.userName;
    }
    const getProgressWidth = (Idx, idx) => {
        if(Idx !== (curPage-0) || idx > curIdx) return "0%";
        else if(idx === curIdx) return `${((timeVal/6) * 100).toFixed(2)}%`; 
        else return "100%";

    }

    const fireViewedStatus = (idx) => {
        let statusId = viewData?.statuses[idx]?._id;
        if(!statusId) return;
        viewStatus(statusId)
            .then(res => {
                if(res.data.info == 'notFound') {
                    socket.emit('viewStatus', { viewerId: user._id, to: id, statusId, time: String(new Date()) });
                    
                    fireViewedUpdate(curIdx-0, id, status, setStatusData);
                }
            })
            .catch(err => setStatusMessage({type:'error',text:'Network error. Failed to update database'}));  
    };

    useEffect(() => {
        // console.log(type,id,startIndex)
        if(type && id) {
            const d = status[type].find(stat => stat.account._id == id);
            if(d) {
                setViewData(d);
            }
            if(!d || !d.statuses[curIdx||(startIndex-0)]) return navigate("/app/status");
            if(type==="recentUpdates" && curIdx > (d?.viewed||-1)) {
                fireViewedUpdate(curIdx-0, id, status, setStatusData);
            }
            // if(type==="recentUpdates" && curIdx <= (d.statuses.viewed||0)) {
                // fireViewedStatus(curIdx);
            // }

        }

        //dont use unmount to update status or run firepushtoviewed

    }, [id, startIndex, type, curIdx]);
    useEffect(() => { setCurIdx(startIndex-0) }, [startIndex]);

    const switchIdx = (Type, clicked) => {
        console.log(Type);
        if(Type==="left") {
            if(curIdx === 0) {
                if(timerRef.current) clearInterval(timerRef.current);
                if(curPage == 0) {
                    return navigate(`/app/status`);
                } else {
                    const prevStatus = status[type][curPage-1];
                    setId(prevStatus.account._id);
                    setCurPage(curPage-1)
                    setStartIndex(prevStatus?.viewed||0);
                    setCurIdx(prevStatus?.viewed||0);
                }     
            } else {
                setCurIdx(curIdx-1);
            }
        } else {
            if(curIdx + 1 >= viewData?.statuses?.length) {
                let newData = [...updatedIds];
                if(!updatedIds.includes(id)) {
                    newData.push(id);
                    setUpdatedIds(newData);
                };
                if(timerRef.current) clearInterval(timerRef.current);
                if(curPage == status[type].length-1) {
                    if(newData.length>0) firePushToViewedUpdate(newData, status, setStatusData);
                    return navigate(`/app/status`);
                } else {
                    const nxtStatus = status[type][(curPage-0)+1];
                    setId(nxtStatus.account._id);
                    setStartIndex(nxtStatus.viewed||0);
                    setCurIdx(nxtStatus?.viewed||0);
                    setCurPage((curPage-0)+1)
                }    
            } else {
                setCurIdx(curIdx+1);
            }
        }

        timeRef.current = 0;
        setTimeVal(0);
    };

    useEffect(() => {
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

    useEffect(() => {
        if(input) stopRef.current = true;
        else stopRef.current = false;
    }, [input]);

    useEffect(() => {
        if(type && curPage) setXPosition((100 / status[type].length).toFixed(2) * (curPage-0));
    }, [curPage])
    

    const leftSwipe = () => {
        //to go to next page on status
        //swipe go like this direction ( to here <--- from here )
        //like towards leftend swipe so start > end touch and
        //this effect in useSwipe hook is for leftSwipe func

        // switchIdx("right", null);
        if(type) {
            if(curPage == status[type].length-1) {
                let newData = [...updatedIds];
                if(!updatedIds.includes(id)) {
                    newData.push(id);
                    setUpdatedIds(newData);
                };
                if(newData.length>0) firePushToViewedUpdate(newData, status, setStatusData);
                return navigate(`/app/status`);
            } else {
                const nxtStatus = status[type][(curPage-0)+1];
                setId(nxtStatus.account._id);
                setStartIndex(nxtStatus?.viewed||0);
                setCurPage((curPage-0)+1);
            }  
        }  
    };
    const rightSwipe = () => {
        //to go to prev page on status
        //swipe go like this direction ( from here ---> to here )
        //like towards right end swipe so start < end touch and
        //this effect in useSwipe hook is for rightSwipe func

        // switchIdx("left", null);
        if(type) {
            if(curPage == 0) {
                return navigate(`/app/status`);
            } else {
                const prevStatus = status[type][curPage-1];
                setId(prevStatus.account._id);
                setStartIndex(prevStatus?.viewed||0);
                setCurPage(curPage-1);
            }    
        }
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
          style={{transform: `translateX(-${xPosition}%)`, width: `${status[type].length*100}%`}}>
            {status[type].map((Val, Idx) => (
                <div className="SV__Wrapper" key={`SV-${Idx}`}
                style={{width: `${getWidths(status[type].length, 0)}`}}>
                    <div className="SV__Top">
                        <div className="reels__Trail">
                            {viewData.statuses.map((val, idx) => (
                                <div className="Reel" key={`reel-${idx}`} 
                                style={{width: getWidths(viewData.statuses.length, 3)}}>
                                    <div style={{width: getProgressWidth(Idx, idx)}}></div>
                                </div>
                            ))}
                        </div>
                        <div className="SV__User">
                            <div onClick={() => {
                                if(updatedIds.length>0) firePushToViewedUpdate(updatedIds, status, setStatusData);
                                navigate('/app/status');
                            }} style={{cursor:'pointer'}}>
                                <BiLeftArrowAlt className="status-icons" />
                            </div>
                            <div>
                                <div className="sv__Img"><img src={viewData.account?.img||defaultImage} alt="" /></div>
                                <div className="sV__Txt">
                                    <span className="big">
                                        {contactName(viewData.account)}
                                    </span>
                                    <span className="small">{formatStatusTime(viewData.statuses[curIdx]?.createdAt)}</span>
                                </div>
                            </div>
                            {/* <div onClick={() => {
                                if(updatedIds.length>0) firePushToViewedUpdate(updatedIds, status, setStatusData);
                                navigate('/app/status');
                            }} style={{cursor:'pointer'}}>
                                <AiOutlineClose className="status-icons" />
                            </div> */}
                        </div>
                    </div>
                    <div className="SV__Main">
                        <div className="sV__Content" {...swipeEvents}>
                            <div className="svAbsolutes left"
                            onClick={() => switchIdx("left", false)}>
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
                    <div className="SV__Base">
                        {(viewData.statuses[curIdx].caption && viewData.statuses[curIdx].statusType === "image") &&
                            <div className="sV__Caption">{viewData.statuses[curIdx].caption}</div>
                        }
                        <div className="reply" onClick={() => setInput(true)}>
                            <AiOutlineArrowUp className="status-icons" />
                            <span>Reply</span>
                        </div>
                    </div>
                    {input && <div className="status-reply-input" ref={statusInputRef}>
                        <Input 
                            statusData={{ ...viewData.statuses[curIdx], poster: viewData.statuses[curIdx].posterId }}
                            input={true} status={true}
                        />
                    </div>}
                </div>
            ))}
          </div>}  
        </div>
    );
}

export default StatusView;