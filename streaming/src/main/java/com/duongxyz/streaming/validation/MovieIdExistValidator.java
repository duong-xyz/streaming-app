package com.duongxyz.streaming.validation;

import com.duongxyz.streaming.repository.MoviesRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class MovieIdExistValidator implements ConstraintValidator<MovieIdExists, Long> {
    private final MoviesRepository moviesRepository;
    @Override
    public boolean isValid(Long movieId, ConstraintValidatorContext constraintValidatorContext) {
        return moviesRepository.existsById(movieId);
    }
}
