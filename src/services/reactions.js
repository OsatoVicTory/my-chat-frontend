import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/reactions";

const options = {
    withCredentials: true
};

export const getReactions = async (messageId, type) => {
    return await axios.get(`${BASE_URL}/${type}/${messageId}`, options);
};

// emojiData should only contain emoji: emoji 
// returns reactions of message in messagesData
export const postReaction = async (messageId, type, emojiData) => {
    return await axios.post(`${BASE_URL}/${type}/${messageId}`, emojiData, options);
};

export const removeReaction = async (messageId, type) => {
    return axios.delete(`${BASE_URL}/${type}/${messageId}`, options);
};