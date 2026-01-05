import api from "../config/api";

const invoiceService = {
    getAll: async () => {
        const res = await api.get('/invoices');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/invoices/${id}`);
        return res.data;
    },

    pay: async (id, coupon_code = null) => {
        const res = await api.patch(`/invoices/${id}/pay`, { coupon_code });
        return res.data;
    }
};

export default invoiceService;
