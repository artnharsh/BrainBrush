import axios from 'axios';
import { useGameStore } from '../store/useGameStore';
import { reportError, toAppError } from '../utils/errorHandler';

// 🚨 FIX 1: Read the exact variable we passed from Docker
// 🚨 FIX 2: Append '/api' if your backend routes require it
const apiBase = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}` 
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
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        reportError(toAppError(error, 'api'));

        if (error.response && error.response.status === 401) {
            console.warn("Token expired or invalid. Logging out");

            // Clear the local storage
            localStorage.removeItem('token');

            // Clear auth state and redirect to login
            const gameStore = useGameStore.getState();
            gameStore.clearAuth();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;