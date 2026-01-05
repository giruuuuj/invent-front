import axios from 'axios';

const API_URL = 'http://localhost:9191/invent';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers['Authorization'] = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Save SKU
export const saveSKU = (sku) => {
    return api.post('/sku', sku);
};

// Get all SKUs
export const getAllskuIds = () => {
    return api.get('/sku');
};

// Get SKU by ID
export const getSKUById = (id) => {
    return api.get(`/sku/${id}`);
};

// Delete SKU by ID
export const deleteSKUById = (id) => {
    return api.delete(`/sku/${id}`);
};

// Update SKU
export const updateSKU = (sku) => {
    return api.put('/sku', sku);
};
