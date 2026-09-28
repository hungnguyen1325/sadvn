package com.app.backend.modules.customer;

import lombok.*;

import java.util.List;

public class CustomerDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchResponse {
        private String id;               // ID hiển thị (vd: BGV-12 hoặc SAD-0100683952)
        private String code;             // username hoặc DoiTacID/Code
        private String name;             // fullname hoặc DoiTacName
        private String phone;            // DoiTacTel hoặc rỗng
        private String email;            // DoiTacEmail hoặc rỗng
        private String address;          // DoiTacAdd hoặc rỗng
        private String source;           // Mã nguồn: "BangGiaVang" | "SADVietNam" | "DB3"
        private String sourceLabel;      // Tên nhãn nguồn: "Bảng Giá Vàng" | "SAD Việt Nam"
        private String customerType;     // "individual" | "enterprise"
        private String tier;             // "VIP" | "Đối tác" | "Thân thiết" | "Tiêu chuẩn"
        private String status;           // "active" | "inactive"
        private String roleOrDesc;       // roleName hoặc DienGiai
        private String avatar;           // link ảnh nếu có
        private String createdAt;        // ngày tạo / lastLogin
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsResponse {
        private long totalBangGiaVang;
        private long totalSadVietNam;
        private long totalDb3;
        private long totalAll;
        private List<String> activeSources;
    }
}
