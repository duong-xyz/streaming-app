package com.duongxyz.streaming.constant;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

@Getter
@JsonFormat(shape =  JsonFormat.Shape.OBJECT, locale = "vi_VN")
public enum EpisodeStatus {
    PROCESSING("PROCESSING", "Đang xử lý/Convert"),
    READY("READY", "Sẵn sàng chiếu");

    private final String code;
    private final String displayName;

    EpisodeStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
