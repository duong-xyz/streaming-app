package com.duongxyz.streaming.service;

import com.duongxyz.streaming.dto.VideoQualityAdminResponse;
import com.duongxyz.streaming.dto.VideoQualityUserResponse;
import com.duongxyz.streaming.form.VideoQualityCreateForm;
import com.duongxyz.streaming.form.VideoQualityUpdateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VideoQualitiesService {
    Page<VideoQualityUserResponse> findAllForUser(Long episodeId, Pageable pageable);

    Page<VideoQualityAdminResponse> findAllForAdmin(Long episodeId,Pageable pageable);

    VideoQualityAdminResponse create(VideoQualityCreateForm form, Long episodeId);

    VideoQualityAdminResponse update(VideoQualityUpdateForm form, Long id);

    void delete(Long id);
}
