import axios from 'axios';
import { useGameStore } from '../store/useGameStore';
import { reportError, toAppError } from '../utils/errorHandler';

// 🚨 FIX 1: Read the exact variable we passed from Docker
// 🚨 FIX 2: Append '/api' if your backend routes require it
const apiBase = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : 'http://localhost:5000/api';

const axiosClient = axios.create({
    baseURL: apiBase, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);  

// Add response interceptor to handle 401 errors globally
axiosClient.interceptors.request.use(
    (config) => {
        // 🚨 THE FIX: Strip the leading slash so Axios doesn't delete '/api' from the baseURL
        if (config.url && config.url.startsWith('/')) {
            config.url = config.url.substring(1);
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;