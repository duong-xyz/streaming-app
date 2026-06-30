package com.duongxyz.streaming.dto;

import com.duongxyz.streaming.constant.MovieStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieResponse {
    private Long id;
    private String title;
    private String alternativeTitle;
    private String description;
    private String thumbnailUrl;
    private String posterUrl;
    private MovieStatus status;
    private String schedule;
    private Long viewsTotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Trả về danh sách tập phim gọn nhẹ
    private List<EpisodeSummaryResponse> episodes;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EpisodeSummaryResponse {
        private Long id;
        private String name; // Ví dụ: "Tập 1"
        private Integer episodeNumber; // Số tập để sắp xếp
    }
}
