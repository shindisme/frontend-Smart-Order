import api from "../config/api";

const staffService = {
    getAll: async () => {
        const res = await api.get('/staffs');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/staffs/${id}`);
        return res.data;
    },

    insert: async (data) => {
        const res = await api.post('/staffs', data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/staffs/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/staffs/${id}`);
        return res.data;
    },

    resetPassword: async (id) => {
        const res = await api.post(`/staffs/${id}/reset-password`);
        return res.data;
    }
};

export default staffService;
