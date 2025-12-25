import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;