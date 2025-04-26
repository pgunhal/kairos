import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8003', // your server port
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
