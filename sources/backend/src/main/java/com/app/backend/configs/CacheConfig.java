package com.app.backend.configs;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Cache "businesses": lưu danh sách nhà cung cấp vào bộ nhớ sau lần gọi DB đầu tiên.
     * - maximumSize: tối đa 500 entry (đủ dùng cho danh sách doanh nghiệp)
     * - expireAfterWrite: cache tự xóa sau 10 phút kể từ lần ghi gần nhất
     *   (đảm bảo dữ liệu không bị cũ quá lâu ngay cả khi quên evict)
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("businesses", "customer-search", "customer-stats");
        manager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(1000)
                        .expireAfterWrite(5, TimeUnit.MINUTES)
                        .recordStats()
        );
        return manager;
    }
}
