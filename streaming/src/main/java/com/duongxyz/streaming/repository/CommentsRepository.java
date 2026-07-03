package com.duongxyz.streaming.repository;

import com.duongxyz.streaming.entity.Comments;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentsRepository extends JpaRepository<Comments, Long> {
    @EntityGraph(attributePaths = {"user", "replies", "replies.user"})
    Page<Comments> findByEpisodeIdAndParentIsNull(Long episodeId, Pageable pageable);
}
