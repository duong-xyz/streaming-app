import apiClient from "./apiClient";

const episodeService = {
    getAllEpisodesByMovieForUser: async (id, page = 0, size = 100) => {
        return (await apiClient.get(`/movies/${id}/episodes?page=${page}&size=${size}`)).data;
    },
    getAllEpisodesByMovieForAdmin: async (id, page = 0, size = 100) => {
        return (await apiClient.get(`/admin/movies/${id}/episodes?page=${page}&size=${size}`)).data;
    },
    createEpisode: async (movieId, formData) => {
        return (await apiClient.post(`admin/movies/${movieId}/episodes`, formData)).data;
    },
    updateEpisode: async (episodeId, formData) => {
        return (await apiClient.put(`admin/episodes/${episodeId}`, formData)).data;
    },
    deleteEpisode: async (episodeId) => {
        return (await apiClient.delete(`admin/episodes/${episodeId}`)).data
    }
};

export default episodeService;