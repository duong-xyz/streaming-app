package com.duongxyz.streaming.mapper;


import com.duongxyz.streaming.dto.EpisodeAdminResponse;
import com.duongxyz.streaming.dto.EpisodeUserResponse;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.entity.Movies;
import com.duongxyz.streaming.form.EpisodeCreateForm;
import com.duongxyz.streaming.form.EpisodeUpdateForm;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class EpisodeMapper {

    // 1. Khai báo Registry để lưu trữ các bộ chuyển đổi dữ liệu sang Response DTOs
    private static final Map<Class<?>, Function<Episodes, ?>> RESPONSE_MAPPERS = new HashMap<>();

    static {
        // Đăng ký logic map cho EpisodeUserResponse (Cho người xem, tối giản)
        RESPONSE_MAPPERS.put(EpisodeUserResponse.class, episode -> EpisodeUserResponse.builder()
                .id(episode.getId())
                .episodeNumber(episode.getEpisodeNumber())
                .title(episode.getTitle())
                .views(episode.getViews())
                .movieId(episode.getMovie() != null ? episode.getMovie().getId() : null)
                .build());

        // Đăng ký logic map cho EpisodeAdminResponse (Cho quản trị, đầy đủ thông tin)
        RESPONSE_MAPPERS.put(EpisodeAdminResponse.class, episode -> EpisodeAdminResponse.builder()
                .id(episode.getId())
                .episodeNumber(episode.getEpisodeNumber())
                .title(episode.getTitle())
                .views(episode.getViews())
                .status(episode.getStatus())
                .createdAt(episode.getCreatedAt())
                .updatedAt(episode.getUpdatedAt())
                .movieId(episode.getMovie() != null ? episode.getMovie().getId() : null)
                .build());
    }

    // --- Hàm Generic: Map từ Entity sang các loại Response DTO dựa theo targetClass ---
    public static <T> T map(Episodes episode, Class<T> targetClass) {
        if (episode == null) return null;
        if (targetClass == null) throw new IllegalArgumentException("Target class không được để null");

        @SuppressWarnings("unchecked")
        Function<Episodes, T> mapper = (Function<Episodes, T>) RESPONSE_MAPPERS.get(targetClass);

        if (mapper == null) {
            throw new UnsupportedOperationException(
                    String.format("Hệ thống chưa cấu hình logic map từ Episodes sang class: %s", targetClass.getSimpleName())
            );
        }

        return mapper.apply(episode);
    }

    // --- 2. Map từ EpisodeCreateForm sang Entity mới ---
    public static Episodes map(Long movieId, EpisodeCreateForm form) {
        if (form == null) return null;

        // Thiết lập liên kết lỏng bằng cách chỉ gán ID cho thực thể Movies cha
        Movies movie = new Movies();
        movie.setId(movieId);

        return Episodes.builder()
                .episodeNumber(form.getEpisodeNumber())
                .title(form.getTitle())
                .movie(movie)
                // Các trường 'views' và 'status' nhận giá trị mặc định nhờ @Builder.Default trong Entity
                .build();
    }

    // --- 3. Cập nhật Entity hiện có từ EpisodeUpdateForm ---
    public static void map(EpisodeUpdateForm form, Episodes episode) {
        if (form == null || episode == null) return;

        episode.setEpisodeNumber(form.getEpisodeNumber());
        episode.setTitle(form.getTitle());
        episode.setStatus(form.getStatus());
        // Không xử lý thay đổi 'movie' cha tại đây để tránh lỗi logic đổi tập phim sang phim khác
    }
}
