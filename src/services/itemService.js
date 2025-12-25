import api from "../config/api";

const itemService = {
    async getAll() {
        const { data: res } = await api.get('/items');
        return res.data
    },
    async getById(id) {
        const { data: res } = await api.get(`/items/${id}`);
        return res.data;
    },
    async insert(data) {
        const { data: res } = await api.post("/items", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res;
    },
    async update(id, data) {
        const { data: res } = await api.patch(`/items/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res;
    },
    async delete(id) {
        const { data: res } = await api.delete(`/items/${id}`);
        return res;
    }
};

export default itemService;