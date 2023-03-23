import { combineReducers } from "redux";
import userReducer from "./user";
import chatsReducer from "./chats";
import mediaReducer from "./media";
import statusMessageReducer from "./statusMessage";
import messageReducer from "./message";
import focusReducer from "./focus";
import infoReducer from "./info";
import callsReducer from "./calls";
import groupsReducer from "./groups";
import statusReducer from "./status";
import selectedChatsReducer from "./selectedChats";
import curCallReducer from "./curCall";
import loadedStateReducer from "./loadedState";
import statusUploadImageReducer from "./statusUploadImage";

const reducers = combineReducers({
    user: userReducer,
    chats: chatsReducer,
    groups: groupsReducer,
    media: mediaReducer,
    statusMessage: statusMessageReducer,
    selectedChats: selectedChatsReducer,
    message: messageReducer,
    focus: focusReducer,
    info: infoReducer,
    calls: callsReducer,
    curCall: curCallReducer,
    status: statusReducer,
    loadedState: loadedStateReducer,
    statusUploadImage: statusUploadImageReducer,
});

export default reducers;