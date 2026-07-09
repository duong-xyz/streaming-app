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
    Page<MovieItemResponse> findAllMovieItems(MovieFilterForm form, Pageable pageable);
    MovieResponse findMovieById(Long id);
    MovieResponse createMovie(MovieCreateForm form);
    MovieResponse updateMovie(Long id, MovieUpdateForm form);
    void delete(Long movieId);
    void incrementViewTotals(Long movieId);
}
