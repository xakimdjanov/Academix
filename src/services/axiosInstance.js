import axios from 'axios';

const API_BASE_URL = 'https://academixbackend-production.up.railway.app'; // O'zgartirishingiz mumkin

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// So'rov yuborishdan oldin tokenni tekshirish va biriktirish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;