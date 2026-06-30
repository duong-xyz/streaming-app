package com.duongxyz.streaming.repository;

import com.duongxyz.streaming.entity.Episodes;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EpisodesRepository extends JpaRepository<Episodes, Long> {
    Page<Episodes> findByMovieId(Long movieId, Pageable pageable);
}
