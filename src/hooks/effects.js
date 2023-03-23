import {useState, useEffect} from "react";

const useSideEffects = (
    chatsData, groupsData, statusData, callsData, user
) => {

    const [callsNum, setCallsNum] = useState(0);
    const [statusNum, setStatusNum] = useState(0);
    const [chatsNum, setChatsNum] = useState(0);
    const [groupsNum, setGroupsNum]= useState(0);

    useEffect(() => {
        let numUnreads = 0;
        for(var i=0;i<groupsData.length;i++) {
            const { messagesData } = groupsData[i];
            if(messagesData.length > 0) {
                if(!messagesData[messagesData.length-1]?.isRead) numUnreads++;
            }
        }
        setGroupsNum(numUnreads);
    },[JSON.stringify(groupsData)]);

    useEffect(() => {
        let numUnreads = 0;
        for(var i=0;i<chatsData.length;i++) {
            const { messagesData } = chatsData[i];
            if(messagesData.length > 0) {
                if(!messagesData[messagesData.length-1]?.isRead) numUnreads++;
            }
        }
        setChatsNum(numUnreads);
    },[JSON.stringify(chatsData)]);

    useEffect(() => {
        let newCalls = 0;
        for(var i=0;i<callsData.length;i++) {
            if(new Date(callsData[i].createdAt).getTime() > user.callsLastView) newCalls++;
        }
        setCallsNum(newCalls);
    },[JSON.stringify(callsData), JSON.stringify(user)]);

    useEffect(() => {
        let newStatus = 0;
        for(var i=0;i<statusData.length;i++) {
            const len = statusData[i].statuses?.length;
            if(len) {
                if(new Date(statusData[i].statuses[len-1].createdAt).getTime() > user.statusLastView) newStatus++;
            }
        }
        setStatusNum(newStatus);
    }, [JSON.stringify(statusData), JSON.stringify(user)]);

    return {callsNum, chatsNum, groupsNum, statusNum};
}

export default useSideEffects;