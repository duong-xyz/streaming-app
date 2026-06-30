package com.duongxyz.streaming.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class MovieCreateForm {
    @NotBlank(message = "Tiêu đề phim không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @Size(max = 255, message = "Tên gọi khác không được vượt quá 255 ký tự")
    private String alternativeTitle;

    private String description;

    @Size(max = 500, message = "Đường dẫn ảnh thu nhỏ không được vượt quá 500 ký tự")
    private String thumbnailUrl;

    private String posterUrl;

    @Size(max = 255, message = "Lịch chiếu không được vượt quá 255 ký tự")
    private String schedule;
}
