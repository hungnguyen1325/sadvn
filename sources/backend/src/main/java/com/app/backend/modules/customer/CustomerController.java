package com.app.backend.modules.customer;

import com.app.backend.core.response.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerMultiDbService customerMultiDbService;

    /**
     * Tìm kiếm khách hàng đa nguồn (chọc thẳng vào các database BangGiaVang, SADVietNam...)
     *
     * @param query  Từ khóa tìm kiếm (tên, SĐT, username, mã đối tác...)
     * @param source Nguồn dữ liệu: "ALL" | "BangGiaVang" | "SADVietNam"
     * @param limit  Số lượng kết quả tối đa mỗi nguồn (mặc định: 50)
     * @return Danh sách khách hàng tổng hợp từ các database
     */
    @GetMapping("/search")
    public ResponseEntity<SuccessResponse<List<CustomerDto.SearchResponse>>> search(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "ALL") String source,
            @RequestParam(required = false, defaultValue = "5000") Integer limit
    ) {
        List<CustomerDto.SearchResponse> results = customerMultiDbService.search(query, source, limit);
        return ResponseEntity.ok(SuccessResponse.success("Tìm kiếm thông tin khách hàng thành công", results));
    }

    /**
     * Thống kê số lượng khách hàng / tài khoản từ các database
     */
    @GetMapping("/stats")
    public ResponseEntity<SuccessResponse<CustomerDto.StatsResponse>> getStats() {
        CustomerDto.StatsResponse stats = customerMultiDbService.getStats();
        return ResponseEntity.ok(SuccessResponse.success("Lấy thống kê đa nguồn thành công", stats));
    }
}
