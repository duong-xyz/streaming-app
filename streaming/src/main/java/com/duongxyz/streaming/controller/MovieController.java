package com.duongxyz.streaming.controller;

import com.duongxyz.streaming.dto.MovieItemResponse;
import com.duongxyz.streaming.dto.MovieResponse;
import com.duongxyz.streaming.dto.ScheduleResponse;
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

    // Get list of paginated movies to homepage
    @GetMapping
    public ResponseEntity<Page<MovieItemResponse>> getAllMovieItems(
            MovieFilterForm form,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable) {
        Page<MovieItemResponse> movies = moviesService.findAllMovieItems(form, pageable);
        return ResponseEntity.ok(movies);
    }

    // Get detail movie by id
    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovieById(@PathVariable("id") @MovieIdExists Long id) {
        MovieResponse movie = moviesService.findMovieById(id);
        return ResponseEntity.ok(movie);
    }
    /**
     * Endpoint receive clicks to increase views asynchronously
     */
    @PutMapping("/{id}/view")
    public ResponseEntity<Void> incrementMovieView(@PathVariable("id") Long id) {
        moviesService.incrementViewTotals(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint lấy lịch chiếu phim theo Thứ trong tuần (hỗ trợ phân trang)
     * GET /api/v1/movies/schedule?day=FRI&page=0&size=12
     *
     * @param day      Viết tắt của thứ (Ví dụ: MON, TUE, WED, THU, FRI, SAT, SUN)
     * @param pageable Đối tượng phân trang tự động injection từ RequestParam (page, size, sort)
     */
    @GetMapping("/schedule")
    public ResponseEntity<ScheduleResponse> getMovieSchedule(
            @RequestParam(name = "day") String day,
            @PageableDefault(size = 12, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        //This call is made to the Service layer to handle bitmask processing and RAM paging
        ScheduleResponse scheduleResponse = moviesService.getScheduleByDay(day, pageable);
        return ResponseEntity.ok(scheduleResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieCreateForm form) {
        MovieResponse createdMovie = moviesService.createMovie(form);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMovie);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieResponse> updateMovie(
            @PathVariable("id") @MovieIdExists Long id,
            @Valid @RequestBody MovieUpdateForm form) {
        MovieResponse updatedMovie = moviesService.updateMovie(id, form);
        return ResponseEntity.ok(updatedMovie);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable("id") @MovieIdExists Long id) {
        moviesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
