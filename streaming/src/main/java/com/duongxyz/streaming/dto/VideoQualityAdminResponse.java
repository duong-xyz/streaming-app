package com.duongxyz.streaming.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoQualityAdminResponse {
    private Long id;
    private String quality;
    private String m3u8Url;
    private Long episodeId; // Trả về ID để admin biết link này thuộc tập nào
}
