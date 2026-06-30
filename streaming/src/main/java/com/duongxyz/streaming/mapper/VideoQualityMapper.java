package com.duongxyz.streaming.mapper;

import com.duongxyz.streaming.dto.VideoQualityAdminResponse;
import com.duongxyz.streaming.dto.VideoQualityUserResponse;
import com.duongxyz.streaming.entity.Episodes;
import com.duongxyz.streaming.entity.VideoQualities;
import com.duongxyz.streaming.form.VideoQualityCreateForm;
import com.duongxyz.streaming.form.VideoQualityUpdateForm;

public class VideoQualityMapper {
    // --- 1. Map từ Entity sang VideoQualityUserResponse (Cho trình phát phim của User) ---
    public static VideoQualityUserResponse map(VideoQualities quality) {
        if (quality == null) return null;

        return VideoQualityUserResponse.builder()
                .id(quality.getId())
                .quality(quality.getQuality())
                .m3u8Url(quality.getM3u8Url())
                .build();
    }

    // --- 2. Map từ Entity sang VideoQualityAdminResponse (Cho màn hình quản trị Dashboard) ---
    public static VideoQualityAdminResponse mapAdmin(VideoQualities quality) {
        if (quality == null) return null;

        return VideoQualityAdminResponse.builder()
                .id(quality.getId())
                .quality(quality.getQuality())
                .m3u8Url(quality.getM3u8Url())
                .episodeId(quality.getEpisode() != null ? quality.getEpisode().getId() : null)
                .build();
    }

    // --- 3. Map từ VideoQualityCreateForm sang Entity mới ---
    public static VideoQualities map(VideoQualityCreateForm form, Long episodeId) {
        if (form == null) return null;

        // Thiết lập mối liên kết bằng cách chỉ gán ID cho thực thể Episodes cha
        Episodes episode = new Episodes();
        episode.setId(episodeId);

        return VideoQualities.builder()
                .quality(form.getQuality())
                .m3u8Url(form.getM3u8Url())
                .episode(episode)
                .build();
    }

    // --- 4. Cập nhật Entity hiện có từ VideoQualityUpdateForm ---
    public static void map(VideoQualityUpdateForm form, VideoQualities quality) {
        if (form == null || quality == null) return;

        quality.setQuality(form.getQuality());
        quality.setM3u8Url(form.getM3u8Url());
        // Giữ nguyên liên kết episodes cha, không thay đổi luồng phim sang tập khác
    }
}
