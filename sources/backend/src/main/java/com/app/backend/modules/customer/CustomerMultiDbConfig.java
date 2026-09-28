package com.app.backend.modules.customer;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
@Slf4j
public class CustomerMultiDbConfig {

    @Value("${customer-dbs.host}")
    private String host;

    @Value("${customer-dbs.port:1433}")
    private int port;

    @Value("${customer-dbs.username}")
    private String username;

    @Value("${customer-dbs.password}")
    private String password;

    @Value("${customer-dbs.encrypt:false}")
    private boolean encrypt;

    @Value("${customer-dbs.db1-name:BangGiaVang}")
    private String db1Name;

    @Value("${customer-dbs.db2-name:SADVietNam}")
    private String db2Name;

    @Value("${customer-dbs.db3-name:}")
    private String db3Name;

    private DataSource buildDataSource(String dbName, String poolName) {
        HikariConfig config = new HikariConfig();
        String jdbcUrl = String.format("jdbc:sqlserver://%s:%d;database=%s;encrypt=%b;trustServerCertificate=true;",
                host, port, dbName, encrypt);
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        config.setPoolName(poolName);
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(10000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);
        config.setConnectionTestQuery("SELECT 1");

        log.info("Initialized DataSource for Database: [{}] at {}:{}", dbName, host, port);
        return new HikariDataSource(config);
    }

    @Bean(name = "bangGiaVangJdbcTemplate")
    public JdbcTemplate bangGiaVangJdbcTemplate() {
        try {
            DataSource ds = buildDataSource(db1Name, "BangGiaVang-Pool");
            return new JdbcTemplate(ds);
        } catch (Exception e) {
            log.error("Failed to initialize BangGiaVang DataSource: {}", e.getMessage());
            return null;
        }
    }

    @Bean(name = "sadVietNamJdbcTemplate")
    public JdbcTemplate sadVietNamJdbcTemplate() {
        try {
            DataSource ds = buildDataSource(db2Name, "SADVietNam-Pool");
            return new JdbcTemplate(ds);
        } catch (Exception e) {
            log.error("Failed to initialize SADVietNam DataSource: {}", e.getMessage());
            return null;
        }
    }

    @Bean(name = "db3JdbcTemplate")
    public JdbcTemplate db3JdbcTemplate() {
        if (db3Name == null || db3Name.trim().isEmpty()) {
            return null;
        }
        try {
            DataSource ds = buildDataSource(db3Name.trim(), "DB3-Pool");
            return new JdbcTemplate(ds);
        } catch (Exception e) {
            log.error("Failed to initialize DB3 DataSource: {}", e.getMessage());
            return null;
        }
    }
}
