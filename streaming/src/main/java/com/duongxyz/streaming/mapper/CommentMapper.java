package com.duongxyz.streaming.mapper;

import com.duongxyz.streaming.dto.CommentAdminResponse;
import com.duongxyz.streaming.dto.CommentUserResponse;
import com.duongxyz.streaming.entity.Comments;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.form.CommentCreateForm;
import com.duongxyz.streaming.form.CommentUpdateForm;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CommentMapper {
    // --- 1. Map từ Entity sang CommentUserResponse (Cấu trúc đệ quy dạng cây lồng nhau cho User) ---
    public static CommentUserResponse map(Comments comment) {
        if (comment == null) return null;

        // Xử lý đệ quy để map toàn bộ danh sách câu trả lời con (replies)
        List<CommentUserResponse> repliesDto = new ArrayList<>();
        if (comment.getReplies().isEmpty()) {
            repliesDto = comment.getReplies().stream()
                    .map(CommentMapper::map) // Gọi đệ quy chính phương thức map(Comments) này
                    .collect(Collectors.toList());
        }

        return CommentUserResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .username(comment.getUser() != null ? comment.getUser().getUsername() : null)
                .replies(repliesDto)
                .build();
    }

    // --- 2. Map từ Entity sang CommentAdminResponse (Cấu trúc phẳng hóa dữ liệu cho Admin) ---
    public static CommentAdminResponse map(Comments comment, Class<CommentAdminResponse> targetClass) {
        if (comment == null) return null;

        return CommentAdminResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .username(comment.getUser() != null ? comment.getUser().getUsername() : null)
                .episodeId(comment.getEpisode() != null ? comment.getEpisode().getId() : null)
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .build();
    }

    // --- 3. Map từ CommentCreateForm sang Entity mới ---
    public static Comments map(CommentCreateForm form) {
        if (form == null) return null;

        // Gắn ID liên kết lỏng cho Tập phim cha
        Episodes episode = new Episodes();
        episode.setId(form.getEpisodeId());

        // Kiểm tra và gắn ID liên kết lỏng cho Bình luận cha (nếu có)
        Comments parentComment = null;
        if (form.getParentId() != null) {
            parentComment = new Comments();
            parentComment.setId(form.getParentId());
        }

        return Comments.builder()
                .content(form.getContent())
                .episode(episode)
                .parent(parentComment)
                // Trường 'user' để trống để tầng Service tự lấy thông tin từ Token/Session đăng nhập
                .build();
    }

    // --- 4. Cập nhật Entity hiện có từ CommentUpdateForm ---
    public static void map(CommentUpdateForm form, Comments comment) {
        if (form == null || comment == null) return;

        comment.setContent(form.getContent());
    }
}
