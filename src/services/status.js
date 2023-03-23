import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/status";

const options = {
    withCredentials: true
};

export const getAllStatus = async () => {
    return await axios.get(`${BASE_URL}`, options);
};

export const viewStatus = async (id) => {
    return await axios.get(`${BASE_URL}/${id}`, options);
};

export const postStatus = async (data) => {
    return await axios.post(`${BASE_URL}`, data, options);
};

export const deleteStatus = async (id) => {
    return await axios.delete(`${BASE_URL}/${id}`, options);
};