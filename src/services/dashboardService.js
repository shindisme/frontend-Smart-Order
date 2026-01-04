import api from "../config/api";

const dashboardService = {
    getStats: async () => {
        const res = await api.get('/dashboard/stats');
        return res.data;
    }
};

export default dashboardService;
