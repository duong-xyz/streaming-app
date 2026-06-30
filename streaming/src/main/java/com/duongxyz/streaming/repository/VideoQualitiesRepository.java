package com.duongxyz.streaming.repository;

import com.duongxyz.streaming.entity.VideoQualities;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoQualitiesRepository extends JpaRepository<VideoQualities, Long> {
    Page<VideoQualities> findByEpisodeId(long episodeId, Pageable pageable);
}
