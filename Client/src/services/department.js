import api from "./api";

const departmentApi = {
    getAll: (config) => api.get("departments/", { params: config.params }),
    getById: (id) => api.get(`departments/${id}/`),
    create: (data) => api.post("departments/", data),
    update: (id, data) => api.put(`departments/${id}/`, data),
    delete: (id) => api.delete(`departments/${id}/`),
};

export default departmentApi;
