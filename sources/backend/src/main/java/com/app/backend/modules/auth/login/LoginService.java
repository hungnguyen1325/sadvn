package com.app.backend.modules.auth.login;

import com.app.backend.configs.SecurityConfig;
import com.app.backend.core.exceptions.AppException;
import com.app.backend.core.exceptions.ErrorCode;
import com.app.backend.core.jwt.JwtService;
import com.app.backend.core.response.SuccessResponse;
import com.app.backend.entities.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final LoginRepository loginRepository;
    private final SecurityConfig securityConfig;
    private final JwtService jwtService;

    public SuccessResponse<LoginDto.Response> findUserName(LoginDto.Request request) {
        // Không tiết lộ username hay password sai để tránh rò rỉ thông tin xác thực
        Account account = loginRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));

        if (!securityConfig.passwordEncoder().matches(request.getPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        LoginDto.Response response = new LoginDto.Response();
        response.setToken(jwtService.generateToken(account));

        return SuccessResponse.success("Đăng nhập thành công", response);
    }
}
