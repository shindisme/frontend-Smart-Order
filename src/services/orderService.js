import api from "../config/api";

const orderService = {
    getAll: async () => {
        const res = await api.get('/orders');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/orders/${id}`);
        return res.data;
    },

    create: async (data) => {
        const res = await api.post('/orders', data);
        return res.data;
    },

    updateState: async (id, newState) => {
        const res = await api.patch(`/orders/${id}`, { state: newState });
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/orders/${id}`);
        return res.data;
    },

    getByTableId: async (table_id) => {
        const res = await api.get(`/orders/table`, { params: { table_id } });
        return res.data;
    }
};

export default orderService;
