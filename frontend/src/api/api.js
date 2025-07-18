// src/api/api.js veya src/utils/api.js - yeni dosya oluşturun

import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'http://localhost:5003/api', // 5005 yerine 5003 kullanıyoruz  
  timeout: 10000,
});

// Request interceptor - her API çağrısında token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token expire olduğunda logout yap
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired veya invalid
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;