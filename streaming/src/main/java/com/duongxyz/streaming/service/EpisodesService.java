package com.duongxyz.streaming.service;

import com.duongxyz.streaming.dto.EpisodeAdminResponse;
import com.duongxyz.streaming.dto.EpisodeUserResponse;
import com.duongxyz.streaming.form.EpisodeCreateForm;
import com.duongxyz.streaming.form.EpisodeUpdateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EpisodesService {
    Page<EpisodeUserResponse> findEpisodesByMovieForUser(Long movieId, Pageable pageable);

    Page<EpisodeAdminResponse> findEpisodesByMovieForAdmin(Long movieId, Pageable pageable);

    EpisodeAdminResponse create(Long movieId, EpisodeCreateForm form);

    EpisodeAdminResponse update(EpisodeUpdateForm form, Long id);

    void delete(Long id);
}
