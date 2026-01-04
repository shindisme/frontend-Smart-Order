import api from "../config/api";

const authService = {
    login: async (credentials) => {
        const res = await api.post('/auth/login', credentials);

        const userData = {
            token: res.data.token,
            user_id: res.data.user_id,
            username: res.data.username,
            fullname: res.data.fullname,
            email: res.data.email,
            role: res.data.role
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);

        return res.data;
    },

    logout: async () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        try {
            const res = await api.post('/auth/logout');
            return res.data;
        } catch (error) {
            console.log('Logout error:', error);
        }
    },

    getMe: async () => {
        const res = await api.get('/auth/me');
        return res.data;
    },

    changePassword: async (data) => {
        const res = await api.put('/auth/change-password', data);
        return res.data;
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;
