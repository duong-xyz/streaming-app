package com.duongxyz.streaming.entity;

import com.duongxyz.streaming.constant.MovieStatus;
import com.duongxyz.streaming.utils.ScheduleUtils;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Nationalized;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name = "movies")
public class Movies {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "title", nullable = false, length = 255)
    @Nationalized
    private String title;
    @Column(name = "alternative_title", length = 255)
    private String alternativeTitle;
    @Column(name = "description")
    @JdbcTypeCode(Types.LONGNVARCHAR) //@Nationalized for Unicode use with length
    private String description;
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    @Column(name = "poster_url")
    private String posterUrl;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private MovieStatus status=MovieStatus.COMING_SOON;
    @Column(name = "schedule", length = 255)
    private String schedule;
    @Column(name = "views_total")
    @Builder.Default
    private Long viewsTotal = 0L;
    @CreatedDate // Autofill when inserting
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate // Automatically updates when an update is released
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<Episodes> episodes = new ArrayList<>();
    @Transient // Java only uses RAM to return JSON; it does not save to the database
    private Integer latestEpisode;

    // Automatically save both movies and episodes using CascadeType.ALL
    public void addEpisode(Episodes episode) {
        this.episodes.add(episode);
        episode.setMovie(this); // Automatically attach the parent movie to this episode
    }

    // Schedule Utils
    public boolean hasScheduleAt(String targetDay, boolean isEarly) {
        return ScheduleUtils.checkSchedule(this.schedule, targetDay, isEarly);
    }
    public String getBroadcastTime() {
        return ScheduleUtils.getTime(this.schedule);
    }
}
