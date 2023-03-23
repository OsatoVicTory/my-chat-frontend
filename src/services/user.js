import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/user";

const options = {
    withCredentials: true
};

export const loginUser = async (userData) => {
    return axios.post(`${BASE_URL}/login`, userData, options);
}

export const signupUser = async (userData) => {
    return axios.post(`${BASE_URL}/signup`, userData, options);
};

export const verifyAccount = async (token) => {
    return axios.get(`${BASE_URL}/verify-account/${token}`, options);
};

export const forgotPassword = async (userData) => {
    return axios.post(`${BASE_URL}/forgot-password`, { userData }, options);
};

export const userLoggedIn = async () => {
    return axios.get(`${BASE_URL}/user-logged-in`, options);
};

export const forgotPasswordUpdate = async (token) => {
    return axios.get(`${BASE_URL}/forgot-password-update/${token}`, options);
};

export const resetPassword = async (userData) => {
    return axios.post(`${BASE_URL}/reset-password`, userData, options);
};

export const logOut = async () => {
    return axios.get(`${BASE_URL}/logout`, options);
};

export const updateUserAccount = async (userData) => {
    return await axios.post(`${BASE_URL}/update-account`, userData, options);
};

export const saveContact = async (contactData) => {
    return axios.post(`${BASE_URL}/update-contacts`, contactData, options);
};

export const whoCanViewMyStatus = async (contactData) => {
    return axios.post(`${BASE_URL}/who-views-status`, contactData, options);
};

//type is statusLastChecked or callsLastChecked
export const lastCheck = async (type) => {
    return axios.get(`${BASE_URL}/last-check/${type}`, options);
}

export const clearCallLogs = async () => {
    return axios.get(`${BASE_URL}/clear-call-logs`, options);
};

export const getContactsImages = async () => {
    return await axios.get(`${BASE_URL}/contacts`, options);
};

export const shareLinkMessage = async (ids, message) => {
    return await axios.post(`${BASE_URL}/share-link`, { ids, message }, options);
};

export const forwardMessage = async (ids, message) => {
    return await axios.post(`${BASE_URL}/forward-message`, { ids, message }, options);
};
export const searchForUsers = async (input) => {
    return await axios.get(`${BASE_URL}/search-users/${input}`, options);
};