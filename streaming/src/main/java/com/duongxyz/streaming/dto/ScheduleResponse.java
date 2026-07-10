package com.duongxyz.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    private Page<MovieItemResponse> moviesShowingToday;
    private Page<MovieItemResponse> moviesShowingEarly;
}
