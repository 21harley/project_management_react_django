import axios from 'axios';
import { REACT_APP_API_URL } from './../evn';

const axiosInstance = axios.create({
    baseURL: REACT_APP_API_URL, // Cambia esto a tu URL base
});

// Configura un interceptor para añadir el token a cada solicitud
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // O cualquier lugar donde guardes tu token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;