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
    },
    async createVnpayPayment(data) {
        return await api.post('/payments/vnpay/create-payment-url', data);
    }
};

export default paymentService;