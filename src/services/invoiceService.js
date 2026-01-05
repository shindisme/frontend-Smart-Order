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

    getByTableId: async (table_id) => {
        const res = await api.get('/invoices', {
            params: { table_id }
        });
        return res.data;
    },

    getPendingOrders: async (table_id) => {
        const res = await api.get(`/invoices/pending-orders/${table_id}`);
        return res.data;
    },

    getPendingByTable: async (table_id) => {
        const res = await api.get('/invoices/pending', {
            params: { table_id }
        });
        return res.data;
    },

    insert: async (data) => {
        const res = await api.post('/invoices', data);
        return res.data;
    },

    pay: async (id) => {
        const res = await api.patch(`/invoices/${id}/pay`);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/invoices/${id}`);
        return res.data;
    }
};

export default invoiceService;
