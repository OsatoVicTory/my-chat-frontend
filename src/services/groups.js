import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/groups";

const options = {
    withCredentials: true
};

export const getAllGroupMessages = async () => {
    return await axios.get(`${BASE_URL}/all-GC`, options);
};

export const getAndReadSpecificGroupMessages = async (refId, lastView) => {
    return await axios.get(`${BASE_URL}/specific-GC/${refId}/${lastView}`);
};

export const readAllGroupMessages = async (refId) => {
    return await axios.get(`${BASE_URL}/read-GC/${refId}`)
}

export const sendGroupMessage = async (messageData) => {
    return await axios.post(`${BASE_URL}/send-group-message/`, { messageData }, options);
};

export const leftGroupPage = async (refId) => {
    return await axios.get(`${BASE_URL}/left-group-page/${refId}`, options);
};

export const deleteAllGroupMessagesForMe = async (refId) => {
    return await axios.delete(`${BASE_URL}/clear-GCs-for-me/${refId}`, options);
} 

export const deleteOneGroupMessageForAll = async (id) => {
    return await axios.delete(`${BASE_URL}/one-for-all/${id}`, options);
};

export const deleteSpecificGroupMessagesForMe = async (messagesToDelete) => {
    return await axios.post(`${BASE_URL}/for-me`, { messagesToDelete }, options);
};

export const getAllGroupMessageReaders = async (messageId) => {
    return await axios.get(`${BASE_URL}/readers/${messageId}`, options);
};

export const fetchGroupAccount = async (id) => {
    return await axios.get(`${BASE_URL}/fetch-group-account/${id}`, options);
};

export const fetchGroupChatImagesAndParticipants = async (id) => {
    return await axios.get(`${BASE_URL}/fetch-group-images-and-participants/${id}`, options);
};

export const updateDescription = async (id, data) => {
    return await axios.post(`${BASE_URL}/update-description/${id}`, data, options);
};

export const leaveGroup = async (id) => {
    return await axios.get(`${BASE_URL}/exit-group/${id}`, options);
};

export const createNewGroup = async (group) => {
    return await axios.post(`${BASE_URL}/create-group`, group, options);
};

export const makeAdmin = async (id, userId) => {
    return await axios.get(`${BASE_URL}/make-admin/${id}/${userId}`, options);
};

export const addUserToGroup = async (id, data) => {
    await axios.post(`${BASE_URL}/add-user/${id}`, data, options);
};

export const joinGroupLink = async (id) => {
    return await axios.get(`${BASE_URL}/join-group-link/${id}`, options);
};