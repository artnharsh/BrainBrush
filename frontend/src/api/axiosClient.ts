import axios from 'axios';
import { useGameStore } from '../store/useGameStore';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Adjust as needed
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

//add response interceptor to handle 401 errors globally
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Token expired or invalid. Logging out");

            // Clear the local storage
            localStorage.removeItem('token');

            // Clear auth state and redirect to login
            const gameStore = useGameStore.getState();
            gameStore.clearAuth();
            window.location.href = '/login'; // Adjust as needed
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
