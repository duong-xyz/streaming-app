package com.duongxyz.streaming.constant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
//@JsonFormat(shape = JsonFormat.Shape.OBJECT) // make Enum to JSON Object when return API
public enum MovieStatus {
    COMING_SOON("COMING_SOON", "Sắp chiếu"),
    SHOWING("SHOWING", "Đang chiếu"),
    STOPPED("STOPPED", "Hoàn thành");

    private final String code;
    private final String displayName;

    MovieStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    @JsonValue
    public Map<String, Object> toJsonObject() {
        Map<String, Object> map = new HashMap<>();
        map.put("code", this.code);
        map.put("displayName", this.displayName);
        return map;
    }

    // HÀM GIẢI MÃ CHUỖI CHỮ "SHOWING" TỪ TRÌNH DUYỆT GỬI LÊN (PUT/POST)
    @JsonCreator
    public static MovieStatus fromValue(Object value) {
        // case 1: Nếu Frontend gửi lên dạng Object { "code": "SHOWING" }
        if (value instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) value;
            String code = (String) map.get("code");
            return fromCodeString(code);
        }
        // case 2: Nếu Frontend gửi lên dạng chuỗi chữ thuần "SHOWING"
        if (value instanceof String) {
            return fromCodeString((String) value);
        }
        return COMING_SOON;
    }

    private static MovieStatus fromCodeString(String code) {
        if (code == null) return COMING_SOON;
        for (MovieStatus status : MovieStatus.values()) {
            if (status.code.equalsIgnoreCase(code) || status.name().equalsIgnoreCase(code)) {
                return status;
            }
        }
        return COMING_SOON;
    }
}
