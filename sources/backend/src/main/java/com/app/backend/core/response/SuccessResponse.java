package com.app.backend.core.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuccessResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static  <T> SuccessResponse<T> success (String message, T data) {
        return SuccessResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> SuccessResponse<T> success (String message) {
        return SuccessResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }
}
