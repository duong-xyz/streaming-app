package com.duongxyz.streaming.service.impl;

import com.duongxyz.streaming.dto.CommentAdminResponse;
import com.duongxyz.streaming.dto.CommentUserResponse;
import com.duongxyz.streaming.entity.Comments;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.entity.Users;
import com.duongxyz.streaming.form.CommentCreateForm;
import com.duongxyz.streaming.form.CommentUpdateForm;
import com.duongxyz.streaming.mapper.CommentMapper;
import com.duongxyz.streaming.repository.CommentsRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@AllArgsConstructor
@Service
public class CommentsServiceImpl implements com.duongxyz.streaming.service.CommentsService {
    private CommentsRepository commentsRepository;

    @Transactional(readOnly = true)
    @Override
    public Page<CommentUserResponse> getCommentsByEpisode(Long episodeId, Pageable pageable) {
        // Lấy danh sách bình luận gốc (parent == null), Hibernate sẽ tự động fetch danh sách replies đi kèm nếu cấu hình đệ quy ở Mapper
        Page<Comments> commentPage = commentsRepository.findByEpisodeIdAndParentIsNull(episodeId, pageable);
        return commentPage.map(comment -> CommentMapper.map(comment));
    }

    @Transactional(readOnly = true)
    @Override
    public Page<CommentAdminResponse> getAllCommentsForAdmin(Pageable pageable) {
        // Lấy danh sách phẳng toàn bộ hệ thống để hiển thị trên Dashboard kiểm duyệt của Admin
        Page<Comments> adminCommentPage = commentsRepository.findAll(pageable);
        return adminCommentPage.map(comment -> CommentMapper.map(comment, CommentAdminResponse.class));
    }

    @Transactional
    @Override
    public CommentUserResponse createComment(CommentCreateForm form, Long currentUserId) {
        // 1. Áp dụng liên kết lỏng cho User (Lấy từ Token an toàn) và Episode cha
        Users user = new Users();
        user.setId(currentUserId);

        Episodes episode = new Episodes();
        episode.setId(form.getEpisodeId());

        Comments.CommentsBuilder commentBuilder = Comments.builder()
                .content(form.getContent())
                .user(user)
                .episode(episode);

        // 2. Logic lồng nhau (Nếu đây là một phản hồi - Reply)
        if (form.getParentId() != null) {
            Comments parentComment = commentsRepository.findById(form.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Bình luận gốc không tồn tại để phản hồi"));

            // Giới hạn hệ thống chỉ cho phép cấu hình cây 2 cấp để tối ưu giao diện
            if (parentComment.getParent() != null) {
                throw new IllegalArgumentException("Hệ thống chỉ hỗ trợ phản hồi bình luận cấp tối đa là 2");
            }
            commentBuilder.parent(parentComment);
        }
        Comments savedComment = commentsRepository.save(commentBuilder.build());
        return CommentMapper.map(savedComment);
    }

    @Transactional
    @Override
    public CommentUserResponse updateComment(Long commentId, CommentUpdateForm form, Long currentUserId) {
        // 1. Lấy thực thể cũ lên để cập nhật đè (Bắt buộc truy vấn DB)
        Comments comment = commentsRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận cần cập nhật"));

        // 2. Bảo mật hệ thống: Chỉ chính chủ mới được phép thay đổi nội dung
        if (!comment.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bình luận của người khác");
        }

        // 3. Cập nhật dữ liệu thông qua cơ chế Dirty Checking (Không cần gọi .save())
        comment.setContent(form.getContent());

        return CommentMapper.map(comment);
    }

    @Transactional
    @Override
    public void deleteComment(Long commentId, Long currentUserId) {
        Comments comment = commentsRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận cần xóa"));

        // Kiểm tra quyền sở hữu bảo mật
        if (!comment.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận của người khác");
        }

        // cascade = CascadeType.ALL sẽ tự quét sạch các câu trả lời replies con của nó trong DB
        commentsRepository.delete(comment);
    }
}
