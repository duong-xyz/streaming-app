package com.duongxyz.streaming.utils;

public class ScheduleUtils {
    // Used Bitmask logic
    // Map the days of the week to their corresponding bits.
    public static int getBitForDay(String day) {
        return switch (day.toUpperCase()) {
            case "MON", "2" -> 1;
            case "TUE", "3" -> 2;
            case "WED", "4" -> 4;
            case "THU", "5" -> 8;
            case "FRI", "6" -> 16;
            case "SAT", "7" -> 32;
            case "SUN", "CN" -> 64;
            default -> 0;
        };
    }

    /**
     * Check if the schedule String includes screenings on the requested date
     * and for the correct screening category (early/regular)
     */
    public static boolean checkSchedule(String scheduleStr, String targetDay, boolean isEarly) {
        if (scheduleStr == null || !scheduleStr.contains("|")) return false;

        String[] parts = scheduleStr.split("\\|",3);
        if (parts.length < 3) return false;

        int targetBit = getBitForDay(targetDay);
        int normalBitmask = Integer.parseInt(parts[1]);
        int earlyBitmask = Integer.parseInt(parts[2]);

        if (isEarly) {
            return (earlyBitmask & targetBit) != 0; // Phép toán BITWISE AND
        } else {
            return (normalBitmask & targetBit) != 0;
        }
    }

    /**
     * Get showtime hour from the schedule String
     */
    public static String getTime(String scheduleStr) {
        if (scheduleStr == null || !scheduleStr.contains("|")) return "";
        return scheduleStr.split("\\|",2)[0];
    }
}

