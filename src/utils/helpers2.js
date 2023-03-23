export const filterArray = (arr, emoji) => {
    if(emoji == "All") return arr;
    return arr.filter(a => a.emoji == emoji)
};

const findIdx = (data, id) => {
    let idx;
    for(var i=0;i<data.length;i++) {
        if(data[i].account._id == id) {
            idx = i;
            break;
        }
    }
    return idx;
};

export const splitArr = (arr) => {
    let mp = new Map();
    for(var i=0;i<arr.length;i++) {
        let data = mp.get(arr[i].emoji);
        if(data) {
            mp.set(arr[i].emoji, data+1)
        } else {
            mp.set(arr[i].emoji, 1)
        }
    };
    let res = [{emoji:"All",amount:""}];
    for(var i of mp) res.push({emoji: i[0], amount: i[1]});
    return res;
}

export const makeAdmin = (
    id, initiator, initiated, userId, data, setter
) => {
    let idx = findIdx(data, id);
    let newGroup = [...data];
    let participants = newGroup[idx].account.participants.map(val => {
        if(val.userId == userId) return {...val, admin: true};
        else return val;
    });
    newGroup[idx].participants = participants;
    newGroup[idx].messagesData.push({
        messageType: 'madeAdmin',
        message: `${initiator} made ${initiated} admin`
    });
    setter(newGroup);
};

export const addUsersToGroup = (
    id, socketData, contacts, data, setter
) => {
    let idx = findIdx(data, id);
    let newGroup = [...data];
    newGroup[idx].account.participants = [...newGroup[idx].account.participants, ...users.map(val => ({userId: val.userId, admin: false}))];
    const { users, initiator } = socketData;
    let Users = [];
    for(var i=0;i<users.length;i++) {
      Users.push(contacts.find(c => c.userId == users[i]._id)?.userName||users[i].phoneNumber);
    }
    const initiatorName = contacts.find(c => c.userId == initiator.userId)?.userName||initiator.phoneNumber;
    newGroup[idx].messagesData.push({
        messageType: 'added Users',
        message: `${initiatorName} added ${Users.join(", ")}`
    });
    setter(newGroup);
}

export const joinViaGroupLink = (
    id, joiner, contacts, data, setter
) => {
    let idx = findIdx(data, id);
    let newGroup = [...data];
    newGroup[idx].account.participants.push({
        userId: joiner.userId,
        admin: false
    });
    newGroup[idx].messagesData.push({
        messageType: 'joined via group link',
        message: `${contacts.find(c=>c.userId==joiner.userId)?.userName||joiner.phoneNumber} joined via invite link`
    });
    setter(newGroup);
};

export const leaveGroup = (
    id, leaver, contacts, data, setter
)=> {
    let idx = findIdx(data, id);
    let newGroup =[...data];
    newGroup[idx].account.participants = newGroup[idx].accout.participants.filter(user => user.userId !== leaver.userId);
    
    newGroup[idx].messagesData.push({
        messageType: 'joined via group link',
        message: `${contacts.find(c=>c.userId==leaver.userId)?.userName||leaver.phoneNumber} left`
    });
    setter(newGroup);
};

export const receiveMessageLink = (
    targets, curUserId, user, message, chats, 
    setChatsData, groups, setGroupChatsData, socket
) => {
    let idx = null;
    let newChats = [...chats];
    let newGroups = [...groups];
    for(var i=0;i<targets.length;i++) {
        idx = findIdx(targets[i], groups);
        if(idx != null) {
            newGroups[idx].messagesData.push(message[i]);
            newGroups[idx].unReadMessages += 1;
            continue;
        }

        if(targets[i] !== curUserId) {
            idx = findIdx(user._id, chats);
            if(idx != null) {
                newChats[idx].messagesData.push(message[i]);
                newChats[idx].unReadMessages += 1;
            } else newChats.push({
                accounts: user,
                messagesData: [message[i]],
                unReadMessages: 1,
            });
            socket.emit('receivedOneMessage', {
                receiver: curUserId,
                sender: user._id,
                messageId: message[i]._id
            });
        };
    };

    setChatsData(newChats);
    setGroupChatsData(newGroups);
};

export const receiveForwardedMessage = (
    targets, curUserId, user, message, chats, 
    setChatsData, groups, setGroupChatsData, socket
) => {
    let idx = null;
    let newChats = [...chats];
    let newGroups = [...groups];
    for(var i=0;i<targets.length;i++) {
        idx = findIdx(targets[i], groups);
        if(idx != null) {
            newGroups[idx].messagesData.push(message[i]);
            newGroups[idx].unReadMessages += 1;
            continue;
        }

        if(targets[i] !== curUserId) {
            idx = findIdx(user._id, chats);
            if(idx != null) {
                newChats[idx].messagesData.push(message[i]);
                newChats[idx].unReadMessages += 1;
            } else newChats.push({
                accounts: user,
                messagesData: [message[i]],
                unReadMessages: 1,
            });
            socket.emit('receivedOneMessage', {
                receiver: curUserId,
                sender: user._id,
                messageId: message[i]._id
            });
        };
    };

    setChatsData(newChats);
    setGroupChatsData(newGroups);
};

export const sharedMessageLink = (
    accountsData, messagesData,
    chats, setChatsData, 
    groups, setGroupChatsData
) => {
    let idx = null;
    let newChats = [...chats];
    let newGroups = [...groups];
    for(var i=0;i<messagesData.length;i++) {
        idx = findIdx(accountsData[i]._id, chats);
        if(idx != null) {
            newChats[idx].messagesData.push(messagesData[i]);
            continue;
        }
        idx = findIdx(accountsData[i]._id, groups);
        if(idx != null) {
            newGroups[idx].messagesData.push(messagesData[i]);
            continue;
        } 
        newChats.push({
            accounts: accountsData[i],
            messagesData: messagesData[i]
        });
    }
    setChatsData(newChats);
    setGroupChatsData(newGroups);
}
export const forwardMessageData = (
    accountsData, messagesData,
    chats, setChatsData, 
    groups, setGroupChatsData
) => {
    let idx = null;
    let newChats = [...chats];
    let newGroups = [...groups];
    for(var i=0;i<messagesData.length;i++) {
        idx = findIdx(accountsData[i]._id, chats);
        if(idx != null) {
            newChats[idx].messagesData.push(messagesData[i]);
            continue;
        }
        idx = findIdx(accountsData[i]._id, groups);
        if(idx != null) {
            newGroups[idx].messagesData.push(messagesData[i]);
            continue;
        } 
        newChats.push({
            accounts: accountsData[i],
            messagesData: messagesData[i]
        });
    }
    setChatsData(newChats);
    setGroupChatsData(newGroups);
}