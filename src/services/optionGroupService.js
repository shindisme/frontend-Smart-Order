import api from "../config/api";

const optionGroupService = {
    async getAll() {
        const { data } = await api.get('/option-groups');
        return data;
    },
    async getById(id) {
        const { data } = await api.get(`/option-groups/${id}`);
        return data;
    },
    async insert(data) {
        const { data: res } = await api.post('/option-groups', data);
        return res;
    },
    async update(id, data) {
        const { data: res } = await api.put(`/option-groups/${id}`, data);
        return res;
    },
    async delete(id) {
        const { data: res } = await api.delete(`/option-groups/${id}`);
        return res;
    }
};

export default optionGroupService;
