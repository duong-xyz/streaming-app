package com.duongxyz.streaming.repository;

import com.duongxyz.streaming.entity.Comments;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentsRepository extends JpaRepository<Comments, Long> {
    Page<Comments> findByEpisodeIdAndParentIsNull(Long episodeId, Pageable pageable);
}
