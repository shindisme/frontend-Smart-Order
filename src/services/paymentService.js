import api from "../config/api";

const paymentService = {
    async getAll(invoiceId) {
        const query = invoiceId ? `?invoice_id=${invoiceId}` : '';
        return await api.get(`/payments${query}`);
    },
    async getById(id) {
        return await api.get(`/payments/${id}`);
    },
    async create(data) {
        return await api.post('/payments', data);
    }
};

export default paymentService;
