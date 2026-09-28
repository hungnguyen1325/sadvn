package com.app.backend.modules.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

public class BusinessDto {
    // Tạo doanh nghiệp mới
    @Getter
    @Setter
    public static class CreateRequest {
        @NotBlank(message = "Tên doanh nghiệp không được để trống")
        public String name;
        
        public String address;
        
        @NotBlank(message = "Mã số thuế không được để trống")
        public String taxCode;
    }

    // Cập nhật 1 doanh nghiệp
    @Getter
    @Setter
    public static class UpdateRequest {
        @Positive(message = "ID doanh nghiệp phải lớn hơn 0")
        public int id;
        
        @NotBlank(message = "Tên doanh nghiệp không được để trống")
        public String name;
        
        public String address;
        
        @NotBlank(message = "Mã số thuế không được để trống")
        public String taxCode;
        
        public Boolean active;
    }

    // Tìm kiếm doanh nghiệp theo id
    @Getter
    @Setter
    public static class FindIdRequest {
        @Positive(message = "ID doanh nghiệp phải lớn hơn 0")
        public int id;
    }

    @Getter
    @Setter
    public static class FindIdResponse {
        public String name;
        public String address;
        public String taxCode;
    }

    // Tìm kiếm doanh nghiệp theo tên, mã số thuế, địa chỉ
    @Getter
    @Setter
    public static class SearchRequest {
        public String name;        // Tên doanh nghiệp
        public String taxCode;     // Mã số thuế
        public String address;     // Địa chỉ
    }

    @Getter
    @Setter
    public static class SearchResponse {
        public int id;
        public String uuid;
        public String name;
        public String address;
        public String taxCode;
        public Boolean isActive;
    }
}