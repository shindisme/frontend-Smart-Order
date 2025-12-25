import api from "../config/api";

const categoryService = {
    async getAll() {
        return await api.get('/categories');
    },
    async getById(id) {
        return await api.get(`/categories/${id}`);
    },
    async insert(data) {
        return await api.post('/categories', data);
    },
    async update(id, data) {
        return await api.put(`/categories/${id}`, data);
    },
    async delete(id) {
        return await api.delete(`/categories/${id}`);
    }
};

export default categoryService;