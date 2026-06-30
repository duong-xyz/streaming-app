package com.duongxyz.streaming.form;

import com.duongxyz.streaming.constant.EpisodeStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EpisodeUpdateForm {
    @NotNull(message = "Số tập phim không được để trống")
    @Positive(message = "Số tập phim phải là số nguyên dương lớn hơn 0")
    private Integer episodeNumber;

    @Size(max = 255, message = "Tiêu đề tập phim không được vượt quá 255 ký tự")
    private String title;

    @NotNull(message = "Trạng thái tập phim không được để trống")
    private EpisodeStatus status;
}
