package com.duongxyz.streaming.constant;

import lombok.Getter;

@Getter
public enum UserRole {
    ADMIN((byte)10),
    USER((byte)20);

    private final byte code;

    UserRole(byte code) {
        this.code = code;
    }

    public static UserRole fromCode(byte code) {
        for (UserRole role : UserRole.values()) {
            if(role.getCode()==code){
                return  role;
            }
        }
        throw new IllegalArgumentException("Mã role không hợp lệ: " + code);
    }
}
