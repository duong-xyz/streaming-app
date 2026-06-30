package com.duongxyz.streaming.service;

import com.duongxyz.streaming.dto.CommentAdminResponse;
import com.duongxyz.streaming.dto.CommentUserResponse;
import com.duongxyz.streaming.form.CommentCreateForm;
import com.duongxyz.streaming.form.CommentUpdateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface CommentsService {
    @Transactional(readOnly = true)
        // Tối ưu hiệu năng, bỏ qua dirty checking của Hibernate
    Page<CommentUserResponse> getCommentsByEpisode(Long episodeId, Pageable pageable);

    @Transactional(readOnly = true)
    Page<CommentAdminResponse> getAllCommentsForAdmin(Pageable pageable);

    @Transactional
    CommentUserResponse createComment(CommentCreateForm form, Long currentUserId);

    @Transactional
    CommentUserResponse updateComment(Long commentId, CommentUpdateForm form, Long currentUserId);

    @Transactional
    void deleteComment(Long commentId, Long currentUserId);
}
