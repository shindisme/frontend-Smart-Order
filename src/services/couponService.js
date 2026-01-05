import api from '../config/api';

const couponService = {
    getAll: async () => {
        const res = await api.get('/coupons');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/coupons/${id}`);
        return res.data;
    },

    insert: async (data) => {
        const res = await api.post('/coupons', data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/coupons/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/coupons/${id}`);
        return res.data;
    },

    validate: async (code, totalAmount) => {
        const res = await api.post('/coupons/validate', {
            code: code,
            total_amount: totalAmount
        });
        return res.data;
    }
};

export default couponService;
