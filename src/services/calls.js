import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/calls";

const options = {
    withCredentials: true
};

export const getAllCalls = async () => {
    return await axios.get(`${BASE_URL}/all-calls`, options);
};

export const createCall = async (data) => {
    return await axios.post(`${BASE_URL}/all-calls`, data, options);
};