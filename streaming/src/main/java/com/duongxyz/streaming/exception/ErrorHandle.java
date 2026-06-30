package com.duongxyz.streaming.exception;

import jakarta.validation.ConstraintDeclarationException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ErrorHandle extends ResponseEntityExceptionHandler {
    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = "Dữ liệu không hợp lệ";
        Map<String, String> Details = new LinkedHashMap<>();
        for (FieldError error : ex.getFieldErrors()) {
            String key = error.getField();
            String value = error.getDefaultMessage();
            Details.put(key, value);
        }
        ErrorResponse errorResponse = new ErrorResponse(message, Details);
        return new ResponseEntity<>(errorResponse, headers, status);
    }

    @ExceptionHandler(value = ConstraintDeclarationException.class)
    public ResponseEntity<Object> handleConstraintViolation(
            ConstraintViolationException ex
    ) {
        String message = "Dữ liệu không hợp lệ";
        Map<String, String> details = new LinkedHashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String key = violation.getPropertyPath().toString();
            String value = violation.getMessage();
            details.put(key, value);
        }
        ErrorResponse errorResponse = new ErrorResponse(message, details);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
