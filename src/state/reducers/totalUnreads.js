let CHAT_STATE = new Map(), GROUP_STATE = new Map();

const remove = (type, data, state) => {
    if(type=='chat') {
        if(CHAT_STATE.has(data)) {
            CHAT_STATE.delete(data);
            return { ...state, chats: Math.max(0, state.chats - 1) };
        } else return state;
    } else {
        if(GROUP_STATE.has(data)) {
            GROUP_STATE.delete(data);
            return { ...state, groups: Math.max(0, state.groups - 1) };
        } else return state;
    }
}

const add = (type, data, state) => {
    if(type=='chat') {
        if(!CHAT_STATE.has(data)) {
            CHAT_STATE.set(data);
            return { ...state, chats: state.chats + 1 };
        } else return state;
    } else {
        if(!GROUP_STATE.has(data)) {
            GROUP_STATE.set(data);
            return { ...state, groups: state.groups + 1 };
        } else return state;
    }
}

const totalUnreadsReducer = (state = {chats: 0, groups: 0}, action) => {
    switch (action.type) {
        case "GET_TOTAL_UNREADS":
            return state
        case "INIT_CHAT":
            action.payload.map(id => CHAT_STATE.set(id, 1));
            return { ...state, chats: action.payload.length };
        case "INIT_GROUP":
            action.payload.map(id => GROUP_STATE.set(id, 1));
            return { ...state, groups: action.payload.length };
        case "REMOVE_CHAT":
            return remove('chat', action.payload, state);
        case 'REMOVE_GROUP':
            return remove('group', action.payload, state);
        case "ADD_CHAT":
            return add('chat', action.payload, state);
        case 'ADD_GROUP':
            return add('group', action.payload, state);
        default:
            return state
    }
}

export default totalUnreadsReducer;