package com.duongxyz.streaming.constant;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class UserRoleConverter implements AttributeConverter<UserRole, Byte> {
    // convert from Enum to Byte for save to DB
    @Override
    public Byte convertToDatabaseColumn(UserRole userRole) {
        if (userRole == null) {return null;}
        return userRole.getCode();
    }
    // convert from Byte at DB against to Enum in Java
    @Override
    public UserRole convertToEntityAttribute(Byte aByte) {
        if(aByte==null)return null;
        return UserRole.fromCode(aByte);
    }
}
