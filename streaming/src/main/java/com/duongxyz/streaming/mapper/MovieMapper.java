package com.duongxyz.streaming.mapper;

import com.duongxyz.streaming.dto.MovieItemResponse;
import com.duongxyz.streaming.dto.MovieResponse;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.entity.Movies;
import com.duongxyz.streaming.form.MovieCreateForm;
import com.duongxyz.streaming.form.MovieUpdateForm;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class MovieMapper {
    // --- 1. Map sang MovieItemResponse (Dùng cho danh sách, tối ưu bộ nhớ) ---
    public MovieItemResponse map(Movies movie) {
        if (movie == null) return null;

        return MovieItemResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .alternativeTitle(movie.getAlternativeTitle())
                .thumbnailUrl(movie.getThumbnailUrl())
                .posterUrl(movie.getPosterUrl())
                .status(movie.getStatus())
                .schedule(movie.getSchedule())
                .viewsTotal(movie.getViewsTotal())
                .latestEpisode(movie.getLatestEpisode())
                .build();
    }

    // --- 2. Map sang MovieResponse (Dùng cho chi tiết phim, kèm tập phim tóm tắt) ---
    public MovieResponse map(Movies movie, Class<MovieResponse> targetClass) {
        if (movie == null) return null;

        List<MovieResponse.EpisodeSummaryResponse> summaries = new ArrayList<>();
        if (movie.getEpisodes() != null) {
            summaries = movie.getEpisodes().stream()
                    .map(this::mapToEpisodeSummary)
                    .collect(Collectors.toList());
        }

        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .alternativeTitle(movie.getAlternativeTitle())
                .description(movie.getDescription())
                .thumbnailUrl(movie.getThumbnailUrl())
                .posterUrl(movie.getPosterUrl())
                .status(movie.getStatus())
                .schedule(movie.getSchedule())
                .viewsTotal(movie.getViewsTotal())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .episodes(summaries)
                .build();
    }

    // --- 3. Map từ MovieCreateForm sang Entity mới ---
    public Movies map(MovieCreateForm form) {
        if (form == null) return null;

        return Movies.builder()
                .title(form.getTitle())
                .alternativeTitle(form.getAlternativeTitle())
                .description(form.getDescription())
                .thumbnailUrl(form.getThumbnailUrl())
                .posterUrl(form.getPosterUrl())
                .schedule(form.getSchedule())
                // status và viewsTotal sẽ tự động nhận giá trị mặc định nhờ cấu hình @Builder.Default ở Entity
                .build();
    }

    // --- 4. Cập nhật Entity hiện có từ MovieUpdateForm ---
    public void map(MovieUpdateForm form, Movies movie) {
        if (form == null || movie == null) return;

        // Chỉ cập nhật các trường có giá trị truyền lên (Tránh đè null vào dữ liệu cũ)
        if (form.getTitle() != null) movie.setTitle(form.getTitle());
        if (form.getAlternativeTitle() != null) movie.setAlternativeTitle(form.getAlternativeTitle());
        if (form.getDescription() != null) movie.setDescription(form.getDescription());
        if (form.getThumbnailUrl() != null) movie.setThumbnailUrl(form.getThumbnailUrl());
        if (form.getPosterUrl() != null) movie.setPosterUrl(form.getPosterUrl());
        if (form.getStatus() != null) movie.setStatus(form.getStatus());
        if (form.getSchedule() != null) movie.setSchedule(form.getSchedule());
    }

    // --- Hàm bổ trợ map danh sách tập phim nội bộ ---
    private MovieResponse.EpisodeSummaryResponse mapToEpisodeSummary(Episodes episode) {
        if (episode == null) return null;

        return MovieResponse.EpisodeSummaryResponse.builder()
                .id(episode.getId())
                .name(episode.getTitle())
                .episodeNumber(episode.getEpisodeNumber())
                .build();
    }
}
