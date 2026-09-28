package com.app.backend.modules.business;

import com.app.backend.core.response.SuccessResponse;
import com.app.backend.entities.Business;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    /**
     * Lấy tất cả doanh nghiệp trong hệ thống
     *
     * @return ResponseEntity<ApiResponse<List<Business>>>
     */
    @GetMapping("/v1/business")
    public ResponseEntity<SuccessResponse<List<Business>>> findAll() {
        return ResponseEntity.ok(businessService.findAll());
    }

    /**
     * Tìm doanh nghiệp theo ID (lấy thông tin chi tiết)
     *
     * @param id ID của doanh nghiệp
     * @return ResponseEntity<ApiResponse<BusinessDto.FindIdResponse>>
     */
    @GetMapping("/v1/business/{id}")
    public ResponseEntity<SuccessResponse<BusinessDto.FindIdResponse>> findById(@PathVariable Integer id) {
        BusinessDto.FindIdRequest request = new BusinessDto.FindIdRequest();
        request.id = id;
        return ResponseEntity.ok(businessService.findById(request));
    }

    /**
     * Tìm kiếm doanh nghiệp theo tên, mã số thuế, địa chỉ
     * Có thể tìm theo 1 hoặc nhiều tiêu chí
     *
     * @param request Đối tượng chứa thông tin tìm kiếm
     * @return ResponseEntity<ApiResponse<List<BusinessDto.SearchResponse>>>
     */
    @PostMapping("/v1/business/search")
    public ResponseEntity<SuccessResponse<List<BusinessDto.SearchResponse>>> search(@RequestBody BusinessDto.SearchRequest request) {
        return ResponseEntity.ok(businessService.search(request));
    }

    /**
     * Thêm mới doanh nghiệp
     *
     * @param request Đối tượng chứa thông tin doanh nghiệp mới
     * @return ResponseEntity<ApiResponse<Business>>
     */
    @PostMapping("/v1/business/create")
    public ResponseEntity<SuccessResponse<Business>> create(@Valid @RequestBody BusinessDto.CreateRequest request) {
        return ResponseEntity.ok(businessService.create(request));
    }

    /**
     * Cập nhật thông tin doanh nghiệp
     *
     * @param request Đối tượng chứa thông tin cần cập nhật
     * @return ResponseEntity<ApiResponse<Business>>
     */
    @PutMapping("/v1/business/update")
    public ResponseEntity<SuccessResponse<Business>> update(@Valid @RequestBody BusinessDto.UpdateRequest request) {
        return ResponseEntity.ok(businessService.update(request));
    }

    /**
     * Xóa doanh nghiệp (chuyển trạng thái inactive)
     *
     * @param id ID của doanh nghiệp cần xóa
     * @return ResponseEntity<ApiResponse<String>>
     */
    @DeleteMapping("/v1/business/delete/{id}")
    public ResponseEntity<SuccessResponse<String>> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(businessService.delete(id));
    }

}