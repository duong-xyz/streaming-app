package com.duongxyz.streaming.controller;

import com.duongxyz.streaming.dto.CommentAdminResponse;
import com.duongxyz.streaming.dto.CommentUserResponse;
import com.duongxyz.streaming.form.CommentCreateForm;
import com.duongxyz.streaming.form.CommentUpdateForm;
import com.duongxyz.streaming.security.jwt.JwtUtils;
import com.duongxyz.streaming.service.CommentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentsService commentsService;
    private final JwtUtils jwtUtils;

    // Lấy cây danh sách bình luận (chỉ lấy gốc parent == null) theo tập phim
    @GetMapping("/api/v1/comments/{episodeId}")
    public ResponseEntity<Page<CommentUserResponse>> getCommentsByEpisode(
            @PathVariable Long episodeId,
            @PageableDefault(page = 0, size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<CommentUserResponse> comments = commentsService.getCommentsByEpisode(episodeId, pageable);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/api/v1/episodes/{episodeId}/comments")
    public ResponseEntity<CommentUserResponse> createComment(
            @PathVariable Long episodeId,
            @RequestHeader("Authorization") String bearerToken,
            @Valid @RequestBody CommentCreateForm form) {
        String token = bearerToken.substring(7);
        long currentUserId = jwtUtils.extractUserId(token);
        String currentUsername = jwtUtils.extractUsername(token);
        CommentUserResponse createdComment = commentsService.createComment(form, episodeId, currentUserId, currentUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @PutMapping("/api/v1/comments/{id}")
    public ResponseEntity<CommentUserResponse> updateComment(
            @PathVariable("id") Long commentId,
            @RequestHeader("Authorization") String bearerToken,
            @Valid @RequestBody CommentUpdateForm form) {
        String token = bearerToken.substring(7);
        long currentUserId = jwtUtils.extractUserId(token);
        String currentUsername = jwtUtils.extractUsername(token);
        CommentUserResponse updatedComment = commentsService.updateComment(commentId, form, currentUserId, currentUsername);
        return ResponseEntity.ok(updatedComment);
    }

    // Xóa bình luận (Chỉ chính chủ, tự động xóa reply con theo cấu hình Cascade)
    @DeleteMapping("/api/v1/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("id") Long commentId,
            @RequestHeader("X-User-Id") Long currentUserId) {
        commentsService.deleteComment(commentId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    // ==================== ADMIN APIS ====================

    // Admin lấy danh sách phẳng toàn bộ bình luận trong hệ thống để kiểm duyệt, quản lý
    @GetMapping("/api/v1/admin/comments")
    public ResponseEntity<Page<CommentAdminResponse>> getAllCommentsForAdmin(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<CommentAdminResponse> adminComments = commentsService.getAllCommentsForAdmin(pageable);
        return ResponseEntity.ok(adminComments);
    }


    /*@GetMapping("/{commentId}/replies")
    public ResponseEntity<Page<CommentUserResponse>> getReplies(
            @PathVariable Long commentId,
            @PageableDefault(size = 5, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<CommentUserResponse> data = commentService.getRepliesByComment(commentId, pageable);
        return ResponseEntity.ok(data);
    }*/
}
