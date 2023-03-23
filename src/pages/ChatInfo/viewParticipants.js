import React, { useState } from "react";
import "./Index.css";
import defaultImage from "../../svgs/avatar.png";
// import SVGs from "../../svgs/SVGs";
import { useSelector } from "react-redux";
import { BsSearch } from "react-icons/bs";
import { BiLeftArrowAlt } from "react-icons/bi";

const ViewParticipants = ({ participants, setRoute, full, setParticipant }) => {
    const initArr = full ? participants : participants.slice(0, 10);
    const [array, setArray] = useState(initArr);
    const { user } = useSelector(state => state);
    const contactsSaved = (userId) => user.contacts.find(c => c.userId == userId);

    const handleChange = (e) => {
        const { value } = e.target;
        const newArr = participants.filter(participant => (
            (participant?.phoneNumber||"").includes(value) || 
            (participant?.userName||"").includes(value) ||
            user.contacts.find(c => c.userName.includes(value))
        ));
        setArray(newArr);
    }

    return (
        <div className="vP">
            {!full && <div className="vP__Top">
                <span>{participants.length} participants</span>
                <div onClick={() => setRoute("participants")}>
                    <BsSearch className="DM-info-icons svgs-white" />
                </div>
            </div>}
            {full && <div className="vP__Top fixed">
                <div onClick={() => setRoute("info")}>
                    <BiLeftArrowAlt className="DM-info-icons svgs-white" />
                </div>
                <input placeholder="Search..." onChange={handleChange} />
            </div>}
            <ul className={`vP__Lists ${full && "fixed"}`}>
                {array.map((val, idx) => (
                    <li key={`participant-${idx}`} onClick={()=>setParticipant(val)}>
                        <img src={val.img||defaultImage} alt="" />
                        <div className="vP__Desc">
                            <div>
                                <h3>{contactsSaved(val.userId)?.userName||val.phoneNumber}</h3>
                                {val.admin && <div className="admin">Group Admin</div>}
                            </div>
                            <div style={{marginTop: "3px"}}>
                                <span>{val.status}</span>
                                <span className="grey">{val.userName}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ViewParticipants;