import api from "../config/api";

const tableService = {
    async getAll() {
        const res = await api.get('/tables');
        return res.data;
    },
    async getById(id) {
        const res = await api.get(`/tables/${id}`);
        return res.data;
    },
    async create(data) {
        const res = await api.post('/tables', data);
        return res.data;
    },
    async update(id, data) {
        const res = await api.put(`/tables/${id}`, data);
        return res.data;
    },
    async delete(id) {
        const res = await api.delete(`/tables/${id}`);
        return res.data;
    }
};

export default tableService;
