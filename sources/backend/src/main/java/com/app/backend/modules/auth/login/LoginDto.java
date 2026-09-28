package com.app.backend.modules.auth.login;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class LoginDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank(message = "Ten dang nhap la bat buoc")
        public String username;

        @NotBlank(message = "Mat khau la bat buoc")
        public String password;
    }

    @Getter
    @Setter
    public static class Response {
        public String token;
    }
}
