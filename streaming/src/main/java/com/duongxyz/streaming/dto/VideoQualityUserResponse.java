package com.duongxyz.streaming.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoQualityUserResponse {
    private Long id;
    private String quality;
    private String m3u8Url;
}
