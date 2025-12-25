import api from "../config/api";

const optionService = {
    getAll() {
        return api.get('/options');
    },
    getById(id) {
        return api.get(`/options/${id}`);
    },
    insert(data) {
        return api.post('/options', data);
    },
    update(id, data) {
        return api.put(`/options/${id}`, data);
    },
    delete(id) {
        return api.delete(`/options/${id}`);
    }
};

export default optionService;