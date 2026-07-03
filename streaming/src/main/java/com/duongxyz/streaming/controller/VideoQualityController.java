package com.duongxyz.streaming.controller;

import com.duongxyz.streaming.dto.VideoQualityAdminResponse;
import com.duongxyz.streaming.dto.VideoQualityUserResponse;
import com.duongxyz.streaming.form.VideoQualityCreateForm;
import com.duongxyz.streaming.form.VideoQualityUpdateForm;
import com.duongxyz.streaming.service.VideoQualitiesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class VideoQualityController {
    private final VideoQualitiesService videoQualitiesService;

    // Người dùng lấy danh sách chất lượng video theo tập phim
    @GetMapping("/api/v1/episodes/{episodeId}/video-qualities")
    public ResponseEntity<Page<VideoQualityUserResponse>> getAllQualitiesForUser(
            @PathVariable Long episodeId,
            Pageable pageable) {
        Page<VideoQualityUserResponse> qualities = videoQualitiesService.findAllForUser(episodeId, pageable);
        return ResponseEntity.ok(qualities);
    }

    // ==================== ADMIN APIS ====================

    // Admin lấy danh sách chất lượng video theo tập phim
    @GetMapping("/api/v1/admin/episodes/{episodeId}/video-qualities")
    public ResponseEntity<Page<VideoQualityAdminResponse>> getAllQualitiesForAdmin(
            @PathVariable Long episodeId,
            Pageable pageable) {
        Page<VideoQualityAdminResponse> qualities = videoQualitiesService.findAllForAdmin(episodeId, pageable);
        return ResponseEntity.ok(qualities);
    }

    // Thêm chất lượng video mới cho tập phim
    @PostMapping("/api/v1/admin/episodes/{episodeId}/video-qualities")
    public ResponseEntity<VideoQualityAdminResponse> createQuality(
            @Valid @RequestBody VideoQualityCreateForm form,
            @PathVariable Long episodeId) {
        VideoQualityAdminResponse createdQuality = videoQualitiesService.create(form, episodeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdQuality);
    }

    // Cập nhật thông tin chất lượng video
    @PutMapping("/api/v1/admin/video-qualities/{id}")
    public ResponseEntity<VideoQualityAdminResponse> updateQuality(
            @PathVariable Long id,
            @Valid @RequestBody VideoQualityUpdateForm form) {
        VideoQualityAdminResponse updatedQuality = videoQualitiesService.update(form, id);
        return ResponseEntity.ok(updatedQuality);
    }

    // Xóa chất lượng video theo ID
    @DeleteMapping("/api/v1/admin/video-qualities/{id}")
    public ResponseEntity<Void> deleteQuality(@PathVariable Long id) {
        videoQualitiesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
