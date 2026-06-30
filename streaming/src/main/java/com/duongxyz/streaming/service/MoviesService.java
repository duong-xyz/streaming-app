package com.duongxyz.streaming.service;

import com.duongxyz.streaming.dto.MovieItemResponse;
import com.duongxyz.streaming.dto.MovieResponse;
import com.duongxyz.streaming.form.MovieCreateForm;
import com.duongxyz.streaming.form.MovieFilterForm;
import com.duongxyz.streaming.form.MovieUpdateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MoviesService {
    // Lấy danh sách phim cho trang chủ (Cực nhẹ, dùng Method Reference 1 param)
    Page<MovieItemResponse> findAllMovieItems(MovieFilterForm form, Pageable pageable);

    // Lấy chi tiết một bộ phim (Đầy đủ thông tin, truyền thêm Class đích)
    MovieResponse findMovieById(Long id);

    // 1. Tạo mới phim
    MovieResponse createMovie(MovieCreateForm form);

    // 2. Cập nhật phim
    MovieResponse updateMovie(Long id, MovieUpdateForm form);

    void delete(Long movieId);
}
