package com.app.backend.core.exceptions;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // --- DUPLICATION (409) ---
    USER_ALREADY_EXISTS("USER_ALREADY_EXISTS", "Tai khoan da ton tai", HttpStatus.CONFLICT),
    BUSINESS_ALREADY_EXISTS("BUSINESS_ALREADY_EXISTS", "Doanh nghiep da ton tai", HttpStatus.CONFLICT),

    // --- NOTFOUND (404)
    USER_NOT_FOUND("USER_NOT_FOUND", "Tai khoan khong ton tai", HttpStatus.NOT_FOUND),
    BUSINESS_NOT_FOUND("BUSINESS_NOT_FOUND", "Doanh nghiep khong ton tai", HttpStatus.NOT_FOUND),
    NOT_FOUND("NOT_FOUND", "Not Found", HttpStatus.NOT_FOUND),

    // --- VALIUDATE (400)
    INVALID_INPUT("INVALID_INPUT", "Du lieu dau vao khong hop le", HttpStatus.BAD_REQUEST),

    // --- BAD REQUEST
    BAD_REQUEST("BAD_REQUEST", "Yeu cau khong hop le", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "Thong tin dang nhap khong hop le", HttpStatus.UNAUTHORIZED),

    // SERVER_ERROR
    SYSTEM_INTERNAL("SYSTEM_INTERNAL", "He thong ban vui long thu lai sau", HttpStatus.INTERNAL_SERVER_ERROR),
    SYSTEM_ERROR("SYSTEM_ERROR","Da xay ra loi he thong", HttpStatus.INTERNAL_SERVER_ERROR),
    METHOD_NOT_SUPPORTED("METHOD_NOT_SUPPORTED", "Phuong thuc khong duoc ho tro", HttpStatus.METHOD_NOT_ALLOWED);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
