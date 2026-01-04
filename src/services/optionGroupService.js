import api from "../config/api";

const optionGroupService = {
    async getAll() {
        return await api.get('/option-groups');
    },
    async getById(id) {
        return await api.get(`/option-groups/${id}`);
    },
    async insert(data) {
        return await api.post('/option-groups', data);
    },
    async update(id, data) {
        return await api.put(`/option-groups/${id}`, data);
    },
    async delete(id) {
        return await api.delete(`/option-groups/${id}`);
    }
};

export default optionGroupService;
