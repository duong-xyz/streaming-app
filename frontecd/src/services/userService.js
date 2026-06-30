import apiClient from './apiClient'

const userService = {
    getAllUsers: async (page = 0, size = 10) => {
        const response = await apiClient.get(`/users?page=${page}&size=${size}`);
        return response.data;
    },
    updateUser: async (id, userUpdateForm) => {
        const response = await apiClient.put(`/users/${id}`, userUpdateForm);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    }
};

export default userService;