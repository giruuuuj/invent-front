// Services/VendorService.js
import axios from 'axios';

const VENDOR_URL = 'http://localhost:9191/invent/vendor'; // Adjust this URL

export const getAllVendors = () => {
    return axios.get(VENDOR_URL, { withCredentials: true });
};

export const getVendorById = (id) => {
    return axios.get(`${VENDOR_URL}/${id}`, { withCredentials: true });
};

export const createVendor = (vendor) => {
    return axios.post(VENDOR_URL, vendor, { withCredentials: true });
};

export const updateVendor = (id, vendor) => {
    return axios.put(`${VENDOR_URL}/${id}`, vendor, { withCredentials: true });
};

export const deleteVendorById = (id) => {
    return axios.delete(`${VENDOR_URL}/${id}`, { withCredentials: true });
};