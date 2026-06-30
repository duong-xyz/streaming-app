package com.duongxyz.streaming.dto;

import com.duongxyz.streaming.constant.MovieStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieItemResponse {
    private Long id;
    private String title;
    private String alternativeTitle;
    private String thumbnailUrl;
    private String posterUrl;
    private MovieStatus status;
    private String schedule;
    private Long viewsTotal;
    private Integer latestEpisode;
}
