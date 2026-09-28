package com.app.backend.modules.auth.login;

import com.app.backend.core.response.SuccessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LoginController {
    private final LoginService loginService;

    @PostMapping("/v1/auth/login")
    public ResponseEntity<SuccessResponse<LoginDto.Response>> login(@Valid @RequestBody LoginDto.Request request) {
        return ResponseEntity.ok(loginService.findUserName(request));
    }
}
