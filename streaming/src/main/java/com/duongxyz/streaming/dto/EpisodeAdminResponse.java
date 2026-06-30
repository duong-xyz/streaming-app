package com.duongxyz.streaming.dto;

import com.duongxyz.streaming.constant.EpisodeStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpisodeAdminResponse {
    private Long id;
    private Integer episodeNumber;
    private String title;
    private Long views;
    private EpisodeStatus status; // Admin cần biết tập phim là ACTIVE, PENDING hay PROCESSING
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long movieId;
}
