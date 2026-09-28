package com.app.backend.core.database;

import com.app.backend.modules.auth.login.LoginRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final LoginRepository loginRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner initDefaultAccounts() {
        return args -> {
            createDefaultAccountIfMissing("admin", "CNSaoHaNoi@123");
        };
    }

    private void createDefaultAccountIfMissing(String username, String rawPassword) {
        if (loginRepository.existsByUsername(username)) {
            log.info("Tài khoản {} đã tồn tại", username);
            return;
        }

        try {
            int rowsAffected = loginRepository.insertAccount(
                    username,
                    passwordEncoder.encode(rawPassword)
            );

            if (rowsAffected > 0) {
                log.info("Tài khoản {} đã được tạo", username);
                return;
            }

            log.error("Không thể tạo tài khoản {}: insert trả về {} dòng bị ảnh hưởng", username, rowsAffected);
        } catch (DataAccessException ex) {
            log.error("Không thể tạo tài khoản {}: {}", username, ex.getMessage(), ex);
        }
    }
}