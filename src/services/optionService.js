import api from "../config/api";

const optionService = {
    async getAll() {
        return await api.get('/options');
    },
    async getById(id) {
        return await api.get(`/options/${id}`);
    },
    async insert(data) {
        return await api.post('/options', data);
    },
    async update(id, data) {
        return await api.put(`/options/${id}`, data);
    },
    async delete(id) {
        return await api.delete(`/options/${id}`);
    }
};

export default optionService;