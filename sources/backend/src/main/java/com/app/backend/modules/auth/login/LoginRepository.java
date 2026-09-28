package com.app.backend.modules.auth.login;

import com.app.backend.entities.Account;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginRepository extends JpaRepository<Account, Integer> {

    /**
     * Tìm kiếm tài khoản theo username phục vụ việc xác thực đăng nhập
     *
     * @param username Tên đăng nhập
     * @return Optional<Account>
     */
    Optional<Account> findByUsername(String username);

    /**
     * Kiểm tra username đã tồn tại trong hệ thống hay chưa
     *
     * @param username Tên đăng nhập
     * @return boolean
     */
    boolean existsByUsername(String username);

    /**
     * Thêm tài khoản mới vào cơ sở dữ liệu
     * 
     * @param username Tên đăng nhập
     * @param password Mật khẩu đã được mã hóa
     * @return void
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO accounts (username, password) VALUES (:username, :password)", nativeQuery = true)
    int insertAccount(@Param("username") String username, @Param("password") String password);
}
