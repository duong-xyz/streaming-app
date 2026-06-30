package com.duongxyz.streaming.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VideoQualityUpdateForm {
    @NotBlank(message = "Tên chất lượng video không được để trống")
    @Size(max = 50, message = "Tên chất lượng video không được vượt quá 50 ký tự")
    private String quality;

    @NotBlank(message = "Đường dẫn m3u8 không được để trống")
    @Size(max = 255, message = "Đường dẫn m3u8 không được vượt quá 255 ký tự")
    //@Pattern(regexp = "^https?://.*\\.m3u8$", message = "Đường dẫn phải là định dạng link m3u8 hợp lệ")
    private String m3u8Url;
}
