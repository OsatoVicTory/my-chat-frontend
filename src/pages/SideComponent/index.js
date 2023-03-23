import React, { useState, useEffect, useRef } from "react";
import Groups from "./groups/Groups";
import Chats from "./chats/Chats";
import StatusHome from "./StatusHome/StatusHome";
import { useNavigate } from "react-router-dom";
import Calls from "./Calls/Calls";
import LoadingSpinner from "../../components/loading/loading";
import "./sideComponent.css";
// import SVGs from "../../svgs/SVGs";
import { lastCheck, clearCallLogs } from "../../services/user";
import useClickOutside from "../../hooks/useClickOutside";
import useSwipe from "../../hooks/useSwipe";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { callsActions, userActions, statusMessageActions } from "../../state/index";
import useSideEffects from "../../hooks/effects";
import { FaEllipsisV } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { BiLeftArrowAlt } from "react-icons/bi";

const SideComponent = () => {

    const path = window.location.pathname;
    const getPath = (p) => {
        if(p.includes("gc")) return "groups";
        else if(p.includes("status")) return "status";
        else if(p.includes("call")) return "calls";
        else return "chats";
    };

    const [route, setRoute] = useState(getPath(path));
    const Arr = {pos:[0,25,50,75],path:['chats','groups','status','calls']};
    const navigate = useNavigate();
    const { calls, groups, status, chats, user, loadedState } = useSelector(state => state);
    const { contacts } = user;
    const dispatch = useDispatch();
    const { clearCallsData } = bindActionCreators(callsActions, dispatch);
    const { setUserData } = bindActionCreators(userActions, dispatch);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const [pos, setPos] = useState(Arr.pos[Arr.path.indexOf(route)]);
    const infoRef = useRef(null);
    const refToInfo = useRef(null);
    const [info, setInfo] = useState(null);
    const [search, setSearch] = useState(false);
    const [statusPrivacy, setStatusPrivacy] = useState(false);
    const [clearLoading, setClearLoading] = useState(false);
    const arr = ["groups", "chats", "status", "calls"];
    const { callsNum, groupsNum, statusNum, chatsNum } = useSideEffects(chats, groups, status, calls, user);
    // const [statusNum, setStatusNum] = useState(false);
    const handleStatusPrivacy = () => {
        setInfo(null);
        setStatusPrivacy("intro");
    };
    const clearCalls = () => {
        if(clearLoading) return;
        setClearLoading(true);
        clearCallLogs()
            .then(res => {
                setClearLoading(false);
                clearCallsData([]);
            })
            .catch(err => {
                setClearLoading(false);
                setStatusMessage({type:'error',text:'Network error.Failed to clear call logs. Try again with better connectivity'});
            })
    };
    

    const infoData = {
        chats: [
            {name:"New Group", click: () => null},
            {name: "Account Settings", click: () => navigate("/app/profile")}
        ],
        status: [
            {name:"Status Privacy", click: () => handleStatusPrivacy()},
            {name: "Account Settings", click: () => navigate("/app/me/profile")}
        ],
        calls: [
            {name:"Clear Call Logs", click: () => clearCalls()},
            {name: "Account Settings", click: () => navigate("/app/me/profile")}
        ],
    } 

    const handleLeftSwipe = () => {
        // leftSwipe means user swipe follow this direction
        // i.e to here <--- from here which means
        // we are looking to go to nextPage
        // visualize the arrow direction with thumb n see
        const idx = arr.indexOf(route);
        setRoute(arr[Math.min(3, idx+1)]);
    }
    const handleRightSwipe = () => {
        // rightSwipe means user swipe follow this direction
        // i.e from here ---> to here which means
        // we are looking to go to prevPage
        // visualize the arrow direction with thumb n see
        const idx = arr.indexOf(route);
        setRoute(arr[Math.max(0, idx-1)]);
    }
    const returnNull = () => null;

    useClickOutside(infoRef, () => setInfo(null));
    const swipeEvents = useSwipe(handleLeftSwipe, handleRightSwipe, 50, returnNull, returnNull);
    // useClickOutside(statusRef, setStatusPrivacy);

    // useEffect(() => {
    //     console.log("ran path change in side component index");
    //     const val = getPath(path);
    //     if(val !== route) setRoute(val);
    // }, [path]);

    useEffect(() => {
        if(route==="groups" && pos!==25) setPos(25);
        if(route==="chats" && pos!==0) setPos(0);
        if(route==="status") {
            if(pos!==50) setPos(50);
            if(statusNum) {
                setUserData({ statusLastCheck: Date.now() });
                lastCheck('statusLastCheck').catch(err => setStatusMessage({type:'error',text:'Network error'}));
            }
        }
        if(route==="calls") {
            if(pos!==75) setPos(75);
            if(callsNum) {
                setUserData({ callsLastCheck: Date.now() });
                lastCheck('callsLastCheck').catch(err => setStatusMessage({type:'error',text:'Network error'}));
            }
        }
    }, [route, statusNum, callsNum]);

    return (
        <div className="sC">
            <div className="sC__Wrapper">
                {search && <div className="sC__Top__Div">
                    <div className="sC__Top">
                        <div className="sC__Icons"
                        onClick={() => setSearch(false)}>
                            <BiLeftArrowAlt className="main-home-icons" />
                        </div>
                        <input placeholder="Search for Chats" />
                    </div>
                </div>}
                {!search && <div className="sC__Top__Div">
                    <div className="sC__Top">
                        <h2>MyChat</h2>
                        <div className="sC__Icons">
                            <div onClick={() => setSearch(!search)}>
                                <BsSearch className="main-home-icons" />
                            </div>
                            <div onClick={()=>setInfo(true)}>
                                <FaEllipsisV className="main-home-icons" />
                            </div>
                        </div>
                    </div>
                    <div className="sC__Links">
                        <ul>
                            <li className={`sC__Link ${route==="chats"}`}
                            onClick={() => setRoute("chats")}>
                                <span>Chats</span>
                                {chatsNum > 0 && <div className="round">{chatsNum}</div>}
                            </li>
                            <li className={`sC__Link ${route==="groups"}`}
                            onClick={() => setRoute("groups")}>
                                <span>Groups</span>
                                {groupsNum > 0 && <div className="round">{groupsNum}</div>}
                            </li>
                            <li className={`sC__Link ${route==="status"}`}
                            onClick={() => setRoute("status")}>
                                <span>Status</span>
                                {statusNum > 0 && <div style={{fontSize:"20px",marginBottom:"6px"}}>.</div>}
                            </li>
                            <li className={`sC__Link ${route==="calls"}`}
                            onClick={() => setRoute("calls")}>
                                <span>Calls</span>
                                {callsNum > 0 && <div className="round">{callsNum}</div>}
                            </li>
                        </ul>
                    </div>
                </div>}
                {info && <div className="sC__Info" ref={infoRef}>
                    {infoData[route].map((val, idx) => (
                        <div key={`info-${idx}`} onClick={val.click}>
                            {val.name == "Clear Call Logs" ?
                                !clearLoading ? val.name : <LoadingSpinner width={'10px'} height={'10px'} /> :
                                val.name
                            }
                        </div>
                    ))}
                </div>}
                <div className="sC__Divs" {...swipeEvents}
                style={{width: "400%", transform:`translateX(-${pos}%)`,
                height: `calc(100% - ${search?"51px":"105px"})`}}>
                    <div style={{width: "25%"}}><Chats /></div>
                    <div style={{width: "25%"}}><Groups /></div>
                    <div style={{width: "25%"}}>
                        <StatusHome statusPrivacy={statusPrivacy}
                        setStatusPrivacy={setStatusPrivacy} />
                    </div>
                    <div style={{width: "25%"}}>
                        <Calls />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SideComponent;