import React from "react";
import "./StatusTagged.css";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import OptimizedImage from "../OptimizedImage";

const StatusTagged = ({ status, input }) => {

    const user = useSelector(state => state.user);
    const statusData = useSelector(state => state.status);
    const navigate = useNavigate();

    const goToStatus = () => {
        if(input) return;
        const { user } = statusData;
        let idx = null;
        for(var i=0;i<user.statuses.length;i++) {
            if(user.statuses[i]._id == status._id) {
                idx = i;
                break;
            }
        }
        if(idx !== null) return navigate(`/app/view-my-status?index=${idx}`);
        const { viewedUpdates } = statusData;
        if(!viewedUpdates?.length) return;
        let userStatuses, startIndex = null;
        for(var i=0;i<viewedUpdates.length;i++) {
            if(viewedUpdates[i].account._id == status.poster) {
                idx = i;
                userStatuses = viewedUpdates[i].statuses;
                break;
            }
        };
        if(idx == null) return;
        for(var i=0;i<userStatuses.length;i++) {
            if(userStatuses[i]._id == status._id) {
                startIndex = i;
                break;
            }
        }
        if(startIndex !== null) {
            navigate(`/app/view-status?id=${status.poster}&type=viewedUpdates&startIndex=${startIndex}&curPage=${idx}`);
        }
    }
        

    if(status.type=='image') {
        return (
            <div className="statusTagged" onClick={goToStatus}>
                <div className="sT-left">
                    <div className="sT-top">
                        {user.contacts.find(contact => contact.userId == status.poster)?.userName} 
                        ~ Status
                    </div>
                    {status.caption && <div className="sT-message">{status.caption}</div>}
                </div>
                <div className="sT-img">
                    <OptimizedImage data={status.statusValue} alt={'status-img'} />
                </div>
            </div>
        )
    } else {
        return (
            <div className="statusTagged">
                <div className="sT-div-full">
                    <div className="sT-top">
                        {user.contacts.find(contact => contact.userId == status.poster)?.userName} 
                        ~ Status
                    </div>
                    <div className="sT-message">{status.statusValue}</div>
                </div>
            </div>
        )
    }
};

export default StatusTagged;