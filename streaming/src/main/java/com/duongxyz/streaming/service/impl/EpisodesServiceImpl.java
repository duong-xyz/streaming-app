package com.duongxyz.streaming.service.impl;

import com.duongxyz.streaming.dto.EpisodeAdminResponse;
import com.duongxyz.streaming.dto.EpisodeUserResponse;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.form.EpisodeCreateForm;
import com.duongxyz.streaming.form.EpisodeUpdateForm;
import com.duongxyz.streaming.mapper.EpisodeMapper;
import com.duongxyz.streaming.repository.EpisodesRepository;
import com.duongxyz.streaming.service.EpisodesService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@AllArgsConstructor
@Service
public class EpisodesServiceImpl implements EpisodesService {
    private EpisodesRepository episodesRepository;

    @Override
    public Page<EpisodeUserResponse> findEpisodesByMovieForUser(Long movieId, Pageable pageable) {
        return episodesRepository.findByMovieId(movieId, pageable)
                .map(episodes -> EpisodeMapper.map(episodes, EpisodeUserResponse.class));
    }

    @Override
    public Page<EpisodeAdminResponse> findEpisodesByMovieForAdmin(Long movieId, Pageable pageable) {
        return episodesRepository.findByMovieId(movieId, pageable)
                .map(episode -> EpisodeMapper.map(episode, EpisodeAdminResponse.class));
    }

    @Override
    public EpisodeAdminResponse create(Long movieId, EpisodeCreateForm form) {
        Episodes episode = EpisodeMapper.map(movieId, form);
        Episodes createdEpisodes = episodesRepository.save(episode);
        return  EpisodeMapper.map(createdEpisodes, EpisodeAdminResponse.class);
    }

    @Override
    public EpisodeAdminResponse update(EpisodeUpdateForm form, Long id) {
        Episodes ep = episodesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tập phim để cập nhật"));
        EpisodeMapper.map(form,ep);
        return EpisodeMapper.map(ep, EpisodeAdminResponse.class);
    }

    @Override
    public void delete(Long id) {
        episodesRepository.deleteById(id);
    }
}
