import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/chats";

const options = {
    withCredentials: true
};

export const getAllDirectMessages = async () => {
    return await axios.get(`${BASE_URL}/all-DMs`, options);
};

export const getUserDetails = async (id) => {
    return await axios.get(`${BASE_URL}/get-user-details/${id}`, options);
};

export const getSpecificDirectMessages = async (id) => {
    return await axios.get(`${BASE_URL}/specifi-DM/${id}`, options);
};

export const readDirectMessages = async (id) => {
    return axios.get(`${BASE_URL}/read-DM/${id}`, options);
};

export const sendDirectMessage = async (data) => {
    return await axios.post(`${BASE_URL}/send-DM`, data, options);
};

export const deleteAllDirectMessagesForMe = async (id) => {
    return axios.delete(`${BASE_URL}/delete-all-DM-for-me/${id}`, options);
};

export const deleteOneDirectMessageForAll = async (messageId) => {
    return axios.delete(`${BASE_URL}/delete-one-DM-for-all/${messageId}`, options);
};

export const deleteSpecificDirectMessagesForMe = async (messagesToDelete) => {
    return axios.post(`${BASE_URL}/delete-DM-for-me`, { messagesToDelete }, options);
};

export const fetchUserAccount = async (id) => {
    return axios.get(`${BASE_URL}/fetch-user-account/${id}`, options);
};

export const fetchChatImages = async (id) => {
    return axios.get(`${BASE_URL}/fetch-chats-images/${id}`, options);
};