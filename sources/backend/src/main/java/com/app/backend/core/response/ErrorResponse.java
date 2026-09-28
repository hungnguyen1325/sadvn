package com.app.backend.core.response;

import com.app.backend.core.exceptions.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private String type;        // URI mô tả loại lỗi (mặc định: "about:blank")
    private String title;       // Tiêu đề lỗi lấy từ mã lỗi (ví dụ: "INVALID_INPUT")
    private int status;         // HTTP Status Code (ví dụ: 400, 404, 500)
    private String detail;      // Thông điệp báo lỗi chi tiết cho client
    private String instance;    // Endpoint xảy ra lỗi

    private Object errors;      // Chi tiết lỗi của từng trường (nếu có)

    // ===== Các hàm tiện ích tạo phản hồi lỗi nhanh theo chuẩn RFC 7807 =====

    // Tạo lỗi nhanh sử dụng thông báo mặc định của ErrorCode
    public static ErrorResponse from(ErrorCode errorCode, String instance) {
        return ErrorResponse.from(errorCode, errorCode.getMessage(), instance);
    }

    // Tạo lỗi nhanh với thông báo tùy chỉnh (detail)
    public static ErrorResponse from(ErrorCode errorCode, String detail, String instance) {
        return ErrorResponse.builder()
                .type("about:blank")
                .title(errorCode.getCode())
                .status(errorCode.getHttpStatus().value())
                .detail(detail)
                .instance(instance)
                .build();
    }
}
