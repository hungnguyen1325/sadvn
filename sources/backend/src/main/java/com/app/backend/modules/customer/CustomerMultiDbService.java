package com.app.backend.modules.customer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class CustomerMultiDbService {

    @Autowired(required = false)
    @Qualifier("bangGiaVangJdbcTemplate")
    private JdbcTemplate bangGiaVangJdbcTemplate;

    @Autowired(required = false)
    @Qualifier("sadVietNamJdbcTemplate")
    private JdbcTemplate sadVietNamJdbcTemplate;

    @Autowired(required = false)
    @Qualifier("db3JdbcTemplate")
    private JdbcTemplate db3JdbcTemplate;

    @Cacheable(value = "customer-search", key = "{#rawQuery, #source, #limit}")
    public List<CustomerDto.SearchResponse> search(String rawQuery, String source, Integer limit) {
        int maxLimit = (limit != null && limit > 0) ? Math.min(limit, 10000) : 5000;
        String query = (rawQuery != null) ? rawQuery.trim() : "";
        String targetSource = (source != null && !source.trim().isEmpty()) ? source.trim() : "ALL";

        List<CompletableFuture<List<CustomerDto.SearchResponse>>> futures = new ArrayList<>();

        if ("ALL".equalsIgnoreCase(targetSource) || "BangGiaVang".equalsIgnoreCase(targetSource)) {
            futures.add(searchBangGiaVangAsync(query, maxLimit));
        }

        if ("ALL".equalsIgnoreCase(targetSource) || "SADVietNam".equalsIgnoreCase(targetSource)) {
            futures.add(searchSadVietNamAsync(query, maxLimit));
        }

        if ("ALL".equalsIgnoreCase(targetSource) || "DB3".equalsIgnoreCase(targetSource)) {
            if (db3JdbcTemplate != null) {
                futures.add(searchDb3Async(query, maxLimit));
            }
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        List<CustomerDto.SearchResponse> combined = new ArrayList<>();
        for (CompletableFuture<List<CustomerDto.SearchResponse>> future : futures) {
            try {
                combined.addAll(future.get());
            } catch (Exception e) {
                log.error("Error retrieving search results from future: {}", e.getMessage());
            }
        }

        return combined;
    }

    private CompletableFuture<List<CustomerDto.SearchResponse>> searchBangGiaVangAsync(String query, int limit) {
        return CompletableFuture.supplyAsync(() -> {
            if (bangGiaVangJdbcTemplate == null) {
                log.warn("BangGiaVang DataSource is not available");
                return Collections.emptyList();
            }

            try {
                String sql = "SELECT TOP (?) " +
                             "    s.[id], s.[shopTitle], s.[shopSubTitle], s.[shopSubTitle2], " +
                             "    s.[phoneNumber1], s.[phoneNumber2], s.[phoneNumber3], " +
                             "    s.[logoImageUrl], s.[status], " +
                             "    a.[username], a.[fullname] " +
                             "FROM [ShopsTbl] s " +
                             "LEFT JOIN [AccountsTbl] a ON a.[idShop] = s.[id] " +
                             "WHERE (? = '' " +
                             "   OR s.[shopTitle] LIKE ? " +
                             "   OR s.[shopSubTitle] LIKE ? " +
                             "   OR s.[shopSubTitle2] LIKE ? " +
                             "   OR s.[phoneNumber1] LIKE ? " +
                             "   OR s.[phoneNumber2] LIKE ? " +
                             "   OR s.[phoneNumber3] LIKE ? " +
                             "   OR a.[username] LIKE ? " +
                             "   OR a.[fullname] LIKE ?) " +
                             "ORDER BY s.[id] DESC";

                String wildcard = "%" + query + "%";
                return bangGiaVangJdbcTemplate.query(sql, (rs, rowNum) -> mapBangGiaVangShopRow(rs),
                        limit, query,
                        wildcard, wildcard, wildcard,
                        wildcard, wildcard, wildcard,
                        wildcard, wildcard);
            } catch (Exception e) {
                log.error("Failed querying BangGiaVang ShopsTbl: {}", e.getMessage());
                return Collections.emptyList();
            }
        });
    }

    private CustomerDto.SearchResponse mapBangGiaVangShopRow(ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        String shopTitle = rs.getString("shopTitle");
        String shopSubTitle = rs.getString("shopSubTitle");
        String shopSubTitle2 = rs.getString("shopSubTitle2");
        String p1 = rs.getString("phoneNumber1");
        String p2 = rs.getString("phoneNumber2");
        String p3 = rs.getString("phoneNumber3");
        String logoUrl = rs.getString("logoImageUrl");
        Object statusObj = rs.getObject("status");
        boolean isActive = (statusObj == null || rs.getBoolean("status"));
        String username = rs.getString("username");
        String fullname = rs.getString("fullname");

        // Tên khách hàng: ưu tiên shopTitle, nếu trống lấy fullname hoặc username
        String customerName = (shopTitle != null && !shopTitle.trim().isEmpty())
                ? shopTitle.trim()
                : ((fullname != null && !fullname.trim().isEmpty()) ? fullname.trim() : "Tiệm #" + id);

        // Số điện thoại
        List<String> phones = new ArrayList<>();
        if (p1 != null && !p1.trim().isEmpty()) phones.add(p1.trim());
        if (p2 != null && !p2.trim().isEmpty() && !phones.contains(p2.trim())) phones.add(p2.trim());
        if (p3 != null && !p3.trim().isEmpty() && !phones.contains(p3.trim())) phones.add(p3.trim());
        String phoneStr = String.join(" - ", phones);

        // Địa chỉ
        List<String> addresses = new ArrayList<>();
        if (shopSubTitle != null && !shopSubTitle.trim().isEmpty()) addresses.add(shopSubTitle.trim());
        if (shopSubTitle2 != null && !shopSubTitle2.trim().isEmpty() && !addresses.contains(shopSubTitle2.trim())) {
            addresses.add(shopSubTitle2.trim());
        }
        String addressStr = String.join(", ", addresses);

        String codeStr = (username != null && !username.trim().isEmpty())
                ? username.trim()
                : ("SHOP-" + id);

        return CustomerDto.SearchResponse.builder()
                .id("BGV-" + id)
                .code(codeStr)
                .name(customerName)
                .phone(phoneStr)
                .email("")
                .address(addressStr)
                .source("BangGiaVang")
                .sourceLabel("Bảng Giá Vàng")
                .customerType("enterprise")
                .tier("VIP")
                .status(isActive ? "active" : "inactive")
                .roleOrDesc(username != null ? ("Tài khoản: " + username) : "Tiệm vàng BGV")
                .avatar(logoUrl)
                .createdAt(null)
                .build();
    }

    private CompletableFuture<List<CustomerDto.SearchResponse>> searchSadVietNamAsync(String query, int limit) {
        return CompletableFuture.supplyAsync(() -> {
            if (sadVietNamJdbcTemplate == null) {
                log.warn("SADVietNam DataSource is not available");
                return Collections.emptyList();
            }

            try {
                String sql = "SELECT TOP (?) [DoiTacID], [Code], [DoiTacName], [DoiTacAdd], [DoiTacTel], [DoiTacEmail], [Kh_yn], [Status], [datetime0] " +
                             "FROM [dmdoitac] " +
                             "WHERE (? = '' OR [DoiTacID] LIKE ? OR [Code] LIKE ? OR [DoiTacName] LIKE ? OR [DoiTacTel] LIKE ? OR [DoiTacAdd] LIKE ? OR [DoiTacEmail] LIKE ?) " +
                             "ORDER BY [DoiTacID] DESC";

                String wildcard = "%" + query + "%";
                return sadVietNamJdbcTemplate.query(sql, (rs, rowNum) -> mapSadVietNamRow(rs),
                        limit, query, wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
            } catch (Exception e) {
                log.error("Failed querying SADVietNam: {}", e.getMessage());
                return Collections.emptyList();
            }
        });
    }

    private CustomerDto.SearchResponse mapSadVietNamRow(ResultSet rs) throws SQLException {
        String doiTacId = rs.getString("DoiTacID");
        String code = rs.getString("Code");
        String doiTacName = rs.getString("DoiTacName");
        String address = rs.getString("DoiTacAdd");
        String tel = rs.getString("DoiTacTel");
        String email = rs.getString("DoiTacEmail");
        Object khYnObj = rs.getObject("Kh_yn");
        boolean isKh = (khYnObj != null && rs.getInt("Kh_yn") == 1);
        String status = rs.getString("Status");
        java.sql.Timestamp dt0 = rs.getTimestamp("datetime0");

        String displayCode = (code != null && !code.trim().isEmpty()) ? code.trim() : doiTacId;
        boolean isActive = status == null || "1".equals(status) || "A".equalsIgnoreCase(status);

        return CustomerDto.SearchResponse.builder()
                .id("SAD-" + (doiTacId != null ? doiTacId.trim() : displayCode))
                .code(displayCode != null ? displayCode.trim() : "")
                .name(doiTacName != null ? doiTacName.trim() : "")
                .phone(tel != null ? tel.trim() : "")
                .email(email != null ? email.trim() : "")
                .address(address != null ? address.trim() : "")
                .source("SADVietNam")
                .sourceLabel("SAD Việt Nam")
                .customerType("enterprise")
                .tier(isKh ? "VIP" : "Đối tác")
                .status(isActive ? "active" : "inactive")
                .roleOrDesc(isKh ? "Khách hàng mua sắm" : "Đối tác doanh nghiệp")
                .avatar(null)
                .createdAt(dt0 != null ? dt0.toString() : null)
                .build();
    }

    private CompletableFuture<List<CustomerDto.SearchResponse>> searchDb3Async(String query, int limit) {
        return CompletableFuture.supplyAsync(() -> {
            if (db3JdbcTemplate == null) return Collections.emptyList();
            // Dự phòng cho Database thứ 3 khi được cung cấp thêm bảng và trường
            return Collections.emptyList();
        });
    }

    @Cacheable(value = "customer-stats")
    public CustomerDto.StatsResponse getStats() {
        long bgvCount = 0;
        long sadCount = 0;
        List<String> sources = new ArrayList<>();

        if (bangGiaVangJdbcTemplate != null) {
            try {
                Long count = bangGiaVangJdbcTemplate.queryForObject("SELECT COUNT(*) FROM ShopsTbl", Long.class);
                if (count != null) {
                    bgvCount = count;
                    sources.add("BangGiaVang");
                }
            } catch (Exception e) {
                log.error("Failed getting stats from BangGiaVang: {}", e.getMessage());
            }
        }

        if (sadVietNamJdbcTemplate != null) {
            try {
                Long count = sadVietNamJdbcTemplate.queryForObject("SELECT COUNT(*) FROM dmdoitac", Long.class);
                if (count != null) {
                    sadCount = count;
                    sources.add("SADVietNam");
                }
            } catch (Exception e) {
                log.error("Failed getting stats from SADVietNam: {}", e.getMessage());
            }
        }

        return CustomerDto.StatsResponse.builder()
                .totalBangGiaVang(bgvCount)
                .totalSadVietNam(sadCount)
                .totalDb3(0)
                .totalAll(bgvCount + sadCount)
                .activeSources(sources)
                .build();
    }
}
