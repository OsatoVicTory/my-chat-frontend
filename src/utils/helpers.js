const findIdxAndMessageData = (arr, id, key) => {
    for(var i=0;i<arr.length;i++) {
        if(arr[i].account._id == id) {
            return { idx: i, returnedData: arr[i][key] }
        }
    }
    return { idx: null };
}

export const sentMessage = (
    state, stateSetter, data, setter, 
    account, message, id
) => {
    stateSetter([...state, message]);
    let { idx } = findIdxAndMessageData(data, id, "messagesData");
    if(idx===null) {
        setter([
            {
                account: account, 
                messagesData: [message]
            },
            ...data
        ])
    } else {
        let newData = [...data];
        newData[idx].messagesData.push(message)
    }
};

export const readAllMessages = (
    chats, setChats, chatsData, 
    setChatsData, id
) => {
    let newChat = [...chats];
    for(var i=0;i<chats.length;i++) {
        newChat[i].isRead = true;
    };
    if(chatsData?.length > 0) {
        let newChats = [...chatsData];
        let { idx, returnedData } = findIdxAndMessageData(chatsData, id, 'messagesData');
        if(idx !== null) {
            newChats[idx].messagesData = returnedData;
            newChats[idx].unReadMessages = 0;
            newChats[idx].unReads = 0;
        }
        setChatsData(newChats);
    };
    setChats(newChat);
}

export const oneOfYourSentMessageDelivered = (
    chatsData, setChatsData, id, messageId
) => {
    let { idx, returnedData } = findIdxAndMessageData(chatsData, id, 'messagesData');
    for(var i=0;i<returnedData.length;i++) {
        if(returnedData[i]._id == messageId) {
            returnedData[i].isDelivered = true;
            break;
        }
    }
    let newChats = [...chatsData];
    newChats[idx].messagesData = returnedData;
    setChatsData(newChats);
}

export const allYourSentMessageDelivered = (
    chatsData, setChatsData, id
) => {
    //set all messages with id to delivered
    let { idx, returnedData } = findIdxAndMessageData(chatsData, id, 'messagesData');
    for(var i=0;i<returnedData.length;i++) {
        returnedData[i].isDelivered = true;
    }
    let newChats = [...chatsData];
    newChats[idx].messagesData = returnedData;
    setChatsData(newChats);
}

export const receiveMessagesSentToYou = (
    chats, setChats, chatsData, 
    setChatsData, id, newMessage, account = null
) => { 
    if(!chats?.length) {
        //means we are at home-chats page
        let { idx, returnedData } = findIdxAndMessageData(chatsData, id, "messagesData");
        if(idx === null) {
            setChatsData([
                {account, messagesData:[{...newMessage, unReadMessages:1,unReads:1}]}, 
                ...chatsData
            ]);
        } else {
            let data = [...chatsData];
            data[idx].messagesData = [...returnedData, {...newMessage, isDelivered: true }];
            data[idx].unReadMessages += 1;
            data[idx].unReads += 1;
            setChatsData(data);
        }
    } else {
        //means we are in account-chats page
        let newChat = {};
        newChat.messagesData = [...chats, {...newMessage, isRead: true }];
        newChat.unReadMessages = 0;
        newChat.unReads = 0;
        setChats(newChat.messagesData);
        // setUnReads(prev => prev+1);
        if(chatsData?.length) {
            let newChats = chatsData.filter(chat => chat.account._id !== id);
            newChats = [newChat, ...newChats];
            setChatsData(newChats);
        }
    }
}

export const updateReaction = (
    chats, setChats, data, setter, 
    id, messageId, reactionsData
) => {
    let { idx, returnedData } = findIdxAndMessageData(data, id, 'messagesData');
    for(var i=0;i<returnedData.length;i++) {
        if(returnedData[i]._id == messageId) {
            returnedData[i].reactions = reactionsData;
            break;
        }
    };

    if(chats?.length > 0) {
        setChats(returnedData);
        let newChats = [...data];
        newChats[idx].messagesData = returnedData;
        setter(newChats);
    } else {
        let newChats = [...data];
        newChats[idx].messagesData = returnedData;
        setter(newChats);
    }
}

export const deleteMessages = (
    chats, setChats, chatsData, setChatsData,
    id, messagesToDelete
) => {
    let newChat = [];
    for(var i=0;i<chats.length;i++) {
        if(messagesToDelete.find(message => message._id == chats[i]._id)) continue;
        newChat.push(chats[i]);
    }
    setChats(newChat);
    if(chatsData?.length) {
        let newChatsData = [...chatsData];
        let { idx } = findIdxAndMessageData(chatsData, id, 'messagesData');
        if(idx !== null) newChatsData[idx].messagesData = newChat;
        setChatsData(newChatsData);
    }
}

export const deletedMessageForAll = (
    chats, setChats, chatsData, setChatsData,
    messageId, id
) => {
    let newChat = chats.filter(chat => chat._id !== messageId); 
    if(chatsData?.length) {
        let newChats = [...chatsData];
        let { idx } = findIdxAndMessageData(chatsData, id, 'messagesData');
        if(idx !== null) newChats[idx].messagesData = newChat;
        setChatsData(newChats);
    }
    setChats(newChat);
};

export const clearAllChatsForMe = (
    setChats, chatsData, setChatsData, id
) => {
    setChats([]);
    if(chatsData?.length) {
        let newChats = [...chatsData];
        let { idx } = findIdxAndMessageData(chatsData, id, 'messagesData');
        if(idx !== null) newChats[idx].messagesData = [];
        setChatsData(newChats);
    };
};

export const changeUserAccount = (
    account, setAccount = false,
    data, setter, id
) => {
    if(setAccount) setAccount(account);
    if(data?.length) {
        let newChats = [...data];
        let { idx } = findIdxAndMessageData(data, id, 'messagesData');
        if(idx !== null) newChats[idx].account = {...newChats[idx].account, ...account}; 
        setter(newChats);
    };
}

export const changeGroupAccount = (
    account, setAccount = false,
    groupChatsData, setGroupChatsData, id
) => {
    if(setAccount) setAccount(account);
    if(groupChatsData?.length) {
        let newChats = [...groupChatsData];
        let { idx } = findIdxAndMessageData(groupChatsData, id, 'messagesData');
        if(idx !== null) newChats[idx].account = account;
        setGroupChatsData(newChats);
    };
}

export const userTypingMessage = (
    data, setter, id, name
) => {
    let newData = [...data];
    for(var i=0;i<data.length;i++) {
        if(data[i].account._id == id) {
            newData[i].isTyping = name;
            break;
        }
    }
    setter(newData);
}

export const stoppedTypingMessage = (
    data, setter, id
) => {
    let newData = [...data];
    for(var i=0;i<data.length;i++) {
        if(data[i].account._id == id) {
            newData[i].isTyping = null;
            break;
        }
    }
    setter(newData);
}

export const receivedNewStatus= (
    postData, data, setter,
    displayName, posterImg
) => {
    let { user, recentUpdates, viewedUpdates } = data;
    let userStatus = recentUpdates.find(upd => upd.account._id == postData.posterId);
    if(userStatus) {
        userStatus.statuses.push(postData);
        return setter({
            user, viewedUpdates,
            recentUpdates: [userStatus, ...recentUpdates.filter(upd => upd.account._id !== postData.posterId)]
        })
    } else {
        userStatus = viewedUpdates.find(upd => upd.account._id == postData.posterId);
        if(userStatus) {
            userStatus.statuses.push(postData);
            return setter({
                user, 
                recentUpdates: [userStatus, ...recentUpdates],
                viewedUpdates: [...viewedUpdates.filter(upd => upd.account._id !== postData.posterId)]
            })
        } else {
            return setter({
                user, viewedUpdates,
                recentUpdates: [
                    {
                        account: {
                            _id: postData.posterId,
                            userName: displayName,
                            img: posterImg 
                        },
                        statuses: [postData]
                    }, 
                    ...recentUpdates
                ]
            })
        }
    }
}

export const viewedStatus = (
    id, viewerId, time, data, setter
) => {
    let newData = {...data};
    const { statuses } = data.user;
    for(var i=0;i<statuses.length;i++) {
        if(statuses[i]._id == id) {
            newData.user.statuses[i].viewers.push({userId: viewerId, time });
            break;
        }
    }
    setter(newData);
}

export const fireViewedUpdate = (
    idx, id, data, setter
) => {
    let { user, viewedUpdates, recentUpdates } = data;
    for(var i=0;i<recentUpdates.length;i++) {
        if(recentUpdates[i].account._id == id) {
            let { viewed, statuses } = recentUpdates[i];
            if(idx+1 >= viewed) return;
            if(!viewed) viewed = 0;
            recentUpdates[i].viewed = Math.min(statuses.length, viewed + 1);
            return setter({ user, viewedUpdates, recentUpdates });
        }
    }
}

export const firePushToViewedUpdate = (
    ids, data, setter
) => {
    let { user, viewedUpdates, recentUpdates } = data;
    let mp = new Map();
    for(var i=0;i<ids.length;i++) mp.set(ids[i], 1);
    let newRecentUpdates = [];
    for(var j=0;j<recentUpdates.length;j++) {
        if(!mp.has(recentUpdates[j].account._id)) newRecentUpdates.push(recentUpdates[j]);
        else viewedUpdates = [recentUpdates[j], ...viewedUpdates];
    }
    setter({ user, viewedUpdates, recentUpdates: newRecentUpdates });
};

export const addMyNewPost = (
    postData, data, setter
) => {
    let { user, recentUpdates, viewedUpdates } = data;
    user.statuses.push({...postData, viewers: []});
    setter({user, recentUpdates,viewedUpdates});
};

export const deletedStatus = (
    statusId, poster, data, setter
) => {
    let { user, recentUpdates, viewedUpdates } = data;
    let userStatus = recentUpdates.find(upd => upd.account._id == poster);
    
    if(userStatus) {
        let index;
        for(var i=0;i<recentUpdates.length;i++) {
            if(recentUpdates[i].account._id == poster) {
                index = i;
                break;
            }
        }
        recentUpdates[index].statuses = userStatus.filter(status => status._id !== statusId);
        return setter({
            user, viewedUpdates, recentUpdates
        })
    } else {
        userStatus = viewedUpdates.find(upd => upd.account._id == poster);
        if(!userStatus) return;
        let index;
        for(var i=0;i<viewedUpdates.length;i++) {
            if(viewedUpdates[i].account._id == poster) {
                index = i;
                break;
            }
        }
        viewedUpdates[index].statuses = userStatus.filter(status => status._id !== statusId);
        return setter({
            user, 
            recentUpdates,
            viewedUpdates
        })
    }
};

export const deletedMyStatus = (
    id, data, setter
) => {
    let { user } = data;
    user.statuses = user.statuses.filter(status => status._id !== id);
    setter({ ...data, user });
}

export const addCallData = (
    callData, id, image, firstName, data, setter
) => {
    const Data = {
        ...callData,
        account: { _id: id, img: image, firstName }
    }
    setter([{...Data}, ...data]);
};

export const LeftGroup = (
    exiter, message, id, data, setter
) => {
    let newGroupChats = [...data];
    for(var i=0;i<data.length;i++) {
      if(data[i].account._id == id) {
        newGroupChats[i].messagesData.push(message);
        let { participants } = data[i].account;
        newGroupChats[i].account.participants = participants.filter(p => p == exiter);
        break;
      }
    }
    setter(newGroupChats);
}