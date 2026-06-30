package com.duongxyz.streaming.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpisodeUserResponse {
    private Long id;
    private Integer episodeNumber;
    private String title;
    private Long views;
    private Long movieId;
}
