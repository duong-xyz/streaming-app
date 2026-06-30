import apiClient from './apiClient';

const movieService = {
    // Lấy danh sách phim phân trang (Sắp xếp mặc định ID giảm dần như Backend cấu hình)
    getAllMovies: async (page = 0, size = 10) => {
        const response = await apiClient.get(`/movies?page=${page}&size=${size}`);
        return response.data; // Trả về thẳng object Page của Spring Boot (content, totalPages,...)
    },

    // Lấy chi tiết một bộ phim theo ID
    getMovieById: async (id) => {
        const response = await apiClient.get(`/movies/${id}`);
        return response.data;
    },

    // Lấy danh sách tập phim
    getEpisodesByMovie: async (id, page = 0, size = 100) => {
        const response = await apiClient.get(`/movies/${id}/episodes?page=${page}&size=${size}`);
        return response.data;
    },

    // Tạo mới một bộ phim (Chỉ Admin)
    createMovie: async (movieCreateForm) => {
        const response = await apiClient.post('/movies', movieCreateForm);
        return response.data;
    },

    // Cập nhật thông tin phim theo ID (Chỉ Admin)
    updateMovie: async (id, movieUpdateForm) => {
        const response = await apiClient.put(`/movies/${id}`, movieUpdateForm); 
        return response.data;
    },

    // Xóa phim theo ID (Chỉ Admin)
    deleteMovie: async (id) => {
        const response = await apiClient.delete(`/movies/${id}`);   
        return response.data;
    },

    searchMovies: async (keyword, size = 7) => {
        const response = await apiClient.get('/movies', {
            params: {
                search: keyword,
                page: 0,
                size: size,
                sort: 'id,desc'
            }
        });
        return response.data;
    }
};

export default movieService;
