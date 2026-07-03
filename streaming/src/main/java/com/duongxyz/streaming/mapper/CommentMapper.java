package com.duongxyz.streaming.mapper;

import com.duongxyz.streaming.dto.CommentAdminResponse;
import com.duongxyz.streaming.dto.CommentUserResponse;
import com.duongxyz.streaming.entity.Comments;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.form.CommentCreateForm;
import com.duongxyz.streaming.form.CommentUpdateForm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CommentMapper {
    // Map từ Entity sang CommentUserResponse (Cấu trúc đệ quy dạng cây lồng nhau cho User)
    public static CommentUserResponse map(Comments comment) {
        if (comment == null) return null;

        List<CommentUserResponse> repliesDto = new ArrayList<>();
        if(comment.getReplies() != null && !comment.getReplies().isEmpty()){
            for (Comments reply : comment.getReplies()) {
                repliesDto.add(CommentUserResponse.builder()
                        .id(reply.getId())
                        .content(reply.getContent())
                        .createdAt(reply.getCreatedAt())
                        .userId(reply.getUser() != null ? reply.getUser().getId() : null)
                        .username(reply.getUser() != null ? reply.getUser().getUsername() : null)
                        .replies(Collections.emptyList())
                        .build());
            }
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

    // Map từ Entity sang CommentUserResponse
    public static CommentUserResponse map(Comments comment, String currentUsername, Long currentUserId) {
        if (comment == null) return null;

        List<CommentUserResponse> repliesDto = new ArrayList<>();
        if(comment.getReplies() != null && !comment.getReplies().isEmpty()){
            for (Comments reply : comment.getReplies()) {
                repliesDto.add(CommentUserResponse.builder()
                        .id(reply.getId())
                        .content(reply.getContent())
                        .createdAt(reply.getCreatedAt())
                        .userId(reply.getUser() != null ? reply.getUser().getId() : null)
                        .username(reply.getUser() != null ? reply.getUser().getUsername() : null)
                        .replies(Collections.emptyList())
                        .build());
            }
        }

        return CommentUserResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .userId(currentUserId)
                .username(currentUsername)
                .replies(repliesDto)
                .build();
    }

    // Map từ Entity sang CommentAdminResponse (Cấu trúc phẳng hóa dữ liệu cho Admin)
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

    // Map từ CommentCreateForm sang Entity mới
    public static Comments map(CommentCreateForm form, Long episodeId) {
        if (form == null) return null;

        // Gắn ID liên kết lỏng cho Tập phim cha
        Episodes episode = new Episodes();
        episode.setId(episodeId);

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
                // user field's empty for service layer process from auth token/session
                .build();
    }

    // Cập nhật Entity hiện có từ CommentUpdateForm
    public static void map(CommentUpdateForm form, Comments comment) {
        if (form == null || comment == null) return;

        comment.setContent(form.getContent());
    }
}
