import apiClient from './apiClient';

const videoQualityService = {
    // 1. GET: Admin lấy danh sách chất lượng video theo tập phim
    getAllQualitiesForAdmin: async (episodeId, page = 0, size = 10) => {
        const response = await apiClient.get(`/admin/episodes/${episodeId}/video-qualities`, {
            params: { page, size }
        });
        return response.data; // Trả về dữ liệu sau khi lệnh await thực hiện xong
    },

    // 2. POST: Thêm chất lượng video mới cho tập phim
    createQuality: async (episodeId, formData) => {
        const response = await apiClient.post(`/admin/episodes/${episodeId}/video-qualities`, formData);
        return response.data;
    },

    // 3. PUT: Cập nhật thông tin chất lượng video theo ID chất lượng
    updateQuality: async (id, formData) => {
        const response = await apiClient.put(`/admin/video-qualities/${id}`, formData);
        return response.data;
    },

    // 4. DELETE: Xóa chất lượng video theo ID
    deleteQuality: async (id) => {
        const response = await apiClient.delete(`/admin/video-qualities/${id}`);
        return response.data;
    },

    // 5. GET: Người dùng lấy danh sách chất lượng video
    getAllQualitiesForUser: async (episodeId, page = 0, size = 10) => {
        const response = await apiClient.get(`/episodes/${episodeId}/video-qualities`, {
            params: { page, size }
        });
        return response.data;
    }
};

export default videoQualityService;
