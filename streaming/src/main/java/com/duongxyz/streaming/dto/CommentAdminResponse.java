package com.duongxyz.streaming.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentAdminResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long userId;
    private String username;
    private Long episodeId;
    private Long parentId; // Hiển thị ID cha trực tiếp thay vì lồng danh sách object
}
