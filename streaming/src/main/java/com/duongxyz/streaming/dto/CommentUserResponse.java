package com.duongxyz.streaming.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentUserResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;

    // Thông tin thu gọn của người bình luận (Tránh trả ra toàn bộ Object Users)
    private Long userId;
    private String username;

    // Danh sách các câu trả lời dạng lồng nhau (Đệ quy cấu trúc)
    private List<CommentUserResponse> replies;
}
