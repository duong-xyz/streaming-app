package com.duongxyz.streaming.constant;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class UserRoleConverter implements AttributeConverter<UserRole, Byte> {
    // Chuyển từ Enum sang Byte để lưu xuống DB
    @Override
    public Byte convertToDatabaseColumn(UserRole userRole) {
        if (userRole == null) {return null;}
        return userRole.getCode();
    }
    // Chuyển từ Byte ở DB ngược lại thành Enum trong Java
    @Override
    public UserRole convertToEntityAttribute(Byte aByte) {
        if(aByte==null)return null;
        return UserRole.fromCode(aByte);
    }
}
