import apiClient from './apiClient'

const commentService = {
    getCommentsByEpisode: async (episodeId, page = 0, size = 10) => {
        const response = await apiClient.get(`/comments/${episodeId}?page=${page}&size=${size}`);
        return response.data;
    },
    createComment: async (episodeId, form) => {
        const response = await apiClient.post(`/episodes/${episodeId}/comments`, form);
        return response.data;
    },
    updateComment: async (commentId, form) => {
        const response = await apiClient.put(`/comments/${commentId}`, form);
        return response.data;
    },
    deleteComment: async (commentId, currentUserId) => {
        const response = await apiClient.delete(`/comments/${commentId}`, {
            headers: { 'X-User-Id': currentUserId }
        });
        return response.data;
    },
    getAllCommentsForAdmin: async (page = 0, size = 10) => {
        const response = await apiClient.get(`/admin/comments?page=${page}&size=${size}`);
        return response.data;
    }
}

export default commentService;