package com.duongxyz.streaming.controller;

import com.duongxyz.streaming.dto.EpisodeAdminResponse;
import com.duongxyz.streaming.dto.EpisodeUserResponse;
import com.duongxyz.streaming.form.EpisodeCreateForm;
import com.duongxyz.streaming.form.EpisodeUpdateForm;
import com.duongxyz.streaming.service.EpisodesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class EpisodeController {
    private final EpisodesService episodesService;

    @GetMapping("/api/v1/movies/{movieId}/episodes")
    public ResponseEntity<Page<EpisodeUserResponse>> getAllEpisodesByMovieForUser(
            @PathVariable Long movieId,
            Pageable pageable) {
        Page<EpisodeUserResponse> episodes = episodesService.findEpisodesByMovieForUser(movieId, pageable);
        return ResponseEntity.ok(episodes);
    }

    // ==================== ADMIN APIS ====================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/movies/{movieId}/episodes")
    public ResponseEntity<Page<EpisodeAdminResponse>> getAllEpisodesByMovieForAdmin(
            @PathVariable Long movieId,
            Pageable pageable) {
        Page<EpisodeAdminResponse> episodes = episodesService.findEpisodesByMovieForAdmin(movieId, pageable);
        return ResponseEntity.ok(episodes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/v1/admin/movies/{movieId}/episodes")
    public ResponseEntity<EpisodeAdminResponse> createEpisode(
            @PathVariable Long movieId,
            @Valid @RequestBody EpisodeCreateForm form) {
        EpisodeAdminResponse createdEpisode = episodesService.create(movieId, form);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEpisode);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/v1/admin/episodes/{episodeId}")
    public ResponseEntity<EpisodeAdminResponse> updateEpisode(
            @PathVariable Long episodeId,
            @Valid @RequestBody EpisodeUpdateForm form) {
        EpisodeAdminResponse updatedEpisode = episodesService.update(form, episodeId);
        return ResponseEntity.ok(updatedEpisode);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/v1/admin/episodes/{episodeId}")
    public ResponseEntity<Void> deleteEpisode(@PathVariable Long episodeId) {
        episodesService.delete(episodeId);
        return ResponseEntity.noContent().build();
    }
}
