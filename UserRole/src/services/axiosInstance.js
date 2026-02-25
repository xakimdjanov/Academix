import axios from "axios";

const API_BASE_URL = "https://academixbackend-production.up.railway.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // ❌ bu yerda Content-Type qo‘ymaymiz
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ FormData bo‘lsa multipart, bo‘lmasa json
    const isFormData = config.data instanceof FormData;
    if (isFormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;