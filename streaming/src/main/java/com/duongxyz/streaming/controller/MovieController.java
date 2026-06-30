package com.duongxyz.streaming.controller;

import com.duongxyz.streaming.dto.MovieItemResponse;
import com.duongxyz.streaming.dto.MovieResponse;
import com.duongxyz.streaming.form.MovieCreateForm;
import com.duongxyz.streaming.form.MovieFilterForm;
import com.duongxyz.streaming.form.MovieUpdateForm;
import com.duongxyz.streaming.service.MoviesService;
import com.duongxyz.streaming.validation.MovieIdExists;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
@Validated
public class MovieController {
    private final MoviesService moviesService;

    // Lấy danh sách phim phân trang cho trang chủ
    // Không cần @PreAuthorize -> Mở công khai cho mọi User (hoặc khách) xem danh sách phim
    @GetMapping
    public ResponseEntity<Page<MovieItemResponse>> getAllMovieItems(
            MovieFilterForm form,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable) {
        Page<MovieItemResponse> movies = moviesService.findAllMovieItems(form, pageable);
        return ResponseEntity.ok(movies);
    }

    // Lấy chi tiết một bộ phim theo ID
    // Không cần @PreAuthorize -> Mở công khai để ai cũng bấm vào xem chi tiết phim được
    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovieById(@PathVariable("id") @MovieIdExists Long id) {
        MovieResponse movie = moviesService.findMovieById(id);
        return ResponseEntity.ok(movie);
    }

    // Tạo mới một bộ phim
    // CHỈ ADMIN mới có quyền tạo mới phim
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieCreateForm form) {
        MovieResponse createdMovie = moviesService.createMovie(form);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMovie);
    }

    // Cập nhật thông tin phim theo ID
    // CHỈ ADMIN mới có quyền sửa thông tin phim
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieResponse> updateMovie(
            @PathVariable("id") @MovieIdExists Long id,
            @Valid @RequestBody MovieUpdateForm form) {
        MovieResponse updatedMovie = moviesService.updateMovie(id, form);
        return ResponseEntity.ok(updatedMovie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable("id") @MovieIdExists Long id) {
        moviesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
