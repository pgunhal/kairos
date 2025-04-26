
// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8003',
  withCredentials: true,  // if you need secure cookies later

});

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;