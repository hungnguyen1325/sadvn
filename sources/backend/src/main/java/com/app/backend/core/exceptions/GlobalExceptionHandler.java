package com.app.backend.core.exceptions;

import com.app.backend.core.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    // 1. Lỗi Business Logic của ứng dụng (AppException) - HTTP tùy theo ErrorCode
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        ErrorResponse response = ErrorResponse.from(errorCode, request.getRequestURI());
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    // 2. Lỗi Validate DTO (HTTP 400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        return ErrorResponse.from(ErrorCode.INVALID_INPUT, request.getRequestURI());
    }

    // 3. Lỗi Request Body không hợp lệ (HTTP 400)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return ErrorResponse.from(ErrorCode.BAD_REQUEST, request.getRequestURI());
    }

    // 4. Lỗi Sai phương thức HTTP (HTTP 405)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ErrorResponse handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        return ErrorResponse.from(ErrorCode.METHOD_NOT_SUPPORTED, request.getRequestURI());
    }

    // 5. Lỗi Sai đường dẫn URL (HTTP 404)
    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NoResourceFoundException ex, HttpServletRequest request) {
        return ErrorResponse.from(ErrorCode.NOT_FOUND, request.getRequestURI());
    }

    // 6. Lỗi Hệ thống không lường trước được (HTTP 500)
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneral(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ErrorResponse.from(ErrorCode.SYSTEM_ERROR, request.getRequestURI());
    }
}
