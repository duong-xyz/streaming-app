package com.duongxyz.streaming.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "video_qualities")
public class VideoQualities {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "quality", length = 50)
    private String quality;
    @Column(name = "m3u8_url", length = 255)
    private String m3u8Url;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id", nullable = false)
    private Episodes episode;
}
