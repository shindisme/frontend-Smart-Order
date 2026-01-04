import api from '../config/api';

const couponService = {
    getAll: async () => {
        const res = await api.get('/coupons');
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
