package com.duongxyz.streaming.service.impl;

import com.duongxyz.streaming.dto.VideoQualityAdminResponse;
import com.duongxyz.streaming.dto.VideoQualityUserResponse;
import com.duongxyz.streaming.entity.VideoQualities;
import com.duongxyz.streaming.form.VideoQualityCreateForm;
import com.duongxyz.streaming.form.VideoQualityUpdateForm;
import com.duongxyz.streaming.mapper.VideoQualityMapper;
import com.duongxyz.streaming.repository.VideoQualitiesRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Transactional
@AllArgsConstructor
@Service
public class VideoQualitiesServiceImpl implements com.duongxyz.streaming.service.VideoQualitiesService {
    private VideoQualitiesRepository videoQualitiesRepository;

    @Override
    public Page<VideoQualityUserResponse> findAllForUser(Long episodeId, Pageable pageable) {
        return videoQualitiesRepository.findByEpisodeId(episodeId, pageable)
                .map(VideoQualityMapper::map);
    }

    @Override
    public Page<VideoQualityAdminResponse> findAllForAdmin(Long episodeId,Pageable pageable) {
        return videoQualitiesRepository.findByEpisodeId(episodeId,pageable)
                .map(VideoQualityMapper::mapAdmin);
    }

    @Override
    public VideoQualityAdminResponse create(VideoQualityCreateForm form, Long episodeId) {
        VideoQualities videoQualities = VideoQualityMapper.map(form, episodeId);
        VideoQualities savedVideoQualities = videoQualitiesRepository.save(videoQualities);
        return VideoQualityMapper.mapAdmin(savedVideoQualities);
    }

    @Override
    public VideoQualityAdminResponse update(VideoQualityUpdateForm form, Long id) {
        VideoQualities vq = videoQualitiesRepository.findById(id).orElseThrow();
        VideoQualityMapper.map(form,vq);
        return VideoQualityMapper.mapAdmin(vq);
    }

    @Override
    public void delete(Long id) {
        videoQualitiesRepository.deleteById(id);
    }
}
