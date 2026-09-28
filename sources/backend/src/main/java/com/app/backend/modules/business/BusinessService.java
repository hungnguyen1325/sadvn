package com.app.backend.modules.business;

import com.app.backend.core.exceptions.AppException;
import com.app.backend.core.exceptions.ErrorCode;
import com.app.backend.core.response.SuccessResponse;
import com.app.backend.entities.Business;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class BusinessService {

    private final BusinessRepository businessRepository;

    /**
     * Lấy tất cả doanh nghiệp trong hệ thống.
     * Kết quả được cache vào bộ nhớ sau lần gọi DB đầu tiên.
     * Các lần gọi tiếp theo trả về từ cache mà không truy vấn DB.
     *
     * @return SuccessResponse<List<Business>>
     */
    @Cacheable(value = "businesses", key = "'all'")
    public SuccessResponse<List<Business>> findAll() {
        log.info("[Cache MISS] Truy vấn DB lấy danh sách doanh nghiệp");
        List<Business> businesses = businessRepository.findAll();
        return SuccessResponse.success("Lấy danh sách doanh nghiệp thành công", businesses);
    }


    /**
     * Tìm doanh nghiệp theo ID (lấy thông tin chi tiết)
     *
     * @param request ID của doanh nghiệp
     * @return ApiResponse<BusinessDto.findIdResponse>
     */
    public SuccessResponse<BusinessDto.FindIdResponse> findById(BusinessDto.FindIdRequest request) {
        Business business = businessRepository.findByIdAndIsActiveTrue(request.id)
                .orElseThrow(() -> new AppException(ErrorCode.BUSINESS_NOT_FOUND));

        BusinessDto.FindIdResponse response = new BusinessDto.FindIdResponse();
        response.name = business.getName();
        response.address = business.getAddress();
        response.taxCode = business.getTaxCode();

        return SuccessResponse.success("Lấy thông tin doanh nghiệp thành công", response);
    }

    /**
     * Tìm kiếm doanh nghiệp theo tên, mã số thuế, địa chỉ
     *
     * @param request Đối tượng chứa thông tin tìm kiếm
     * @return ApiResponse<List<BusinessDto.searchResponse>>
     */
    public SuccessResponse<List<BusinessDto.SearchResponse>> search(BusinessDto.SearchRequest request) {
        // Tìm kiếm theo các tiêu chí
        List<Business> businesses = businessRepository.searchBusiness(
                request.name,
                request.taxCode,
                request.address
        );

        // Map sang response DTO
        List<BusinessDto.SearchResponse> responses = businesses.stream()
                .map(this::mapToSearchResponse)
                .collect(Collectors.toList());

        return SuccessResponse.success("Tìm kiếm doanh nghiệp thành công", responses);
    }

    /**
     * Thêm mới doanh nghiệp.
     * Xóa cache "businesses" sau khi tạo thành công để đảm bảo findAll trả về dữ liệu mới.
     *
     * @param request Đối tượng chứa thông tin doanh nghiệp mới
     * @return SuccessResponse<Business>
     */
    @CacheEvict(value = "businesses", allEntries = true)
    public SuccessResponse<Business> create(BusinessDto.CreateRequest request) {

        // Kiểm tra mã số thuế đã tồn tại chưa
        if (businessRepository.existsByTaxCode(request.taxCode)) {
            throw new AppException(ErrorCode.BUSINESS_ALREADY_EXISTS);
        }

        int rowsAffected = businessRepository.insert(request.name, request.taxCode, request.address);

        if (rowsAffected == 0) {
            log.error("Lỗi khi tạo doanh nghiệp");
            throw new AppException(ErrorCode.SYSTEM_ERROR);
        }

        log.info("Doanh nghiệp đã được tạo với mã thuế: {}", request.taxCode);
        return SuccessResponse.success("Thêm mới doanh nghiệp thành công", null);
    }

    /**
     * Cập nhật thông tin doanh nghiệp.
     * Tối ưu: gộp kiểm tra taxCode conflict + update thành 1 lần truy vấn duy nhất.
     * Xóa cache "businesses" sau khi cập nhật thành công.
     *
     * @param request Đối tượng chứa thông tin cần cập nhật
     * @return SuccessResponse
     */
    @CacheEvict(value = "businesses", allEntries = true)
    public SuccessResponse<Business> update(BusinessDto.UpdateRequest request) {
        // 1 lần gọi DB duy nhất: update + kiểm tra taxCode conflict trong cùng 1 SQL
        int rowsAffected = businessRepository.updateIfTaxCodeNotConflict(
                request.id, request.name, request.taxCode, request.address, request.active
        );

        if (rowsAffected == 0) {
            // Phân biệt: không tìm thấy ID hay taxCode bị trùng?
            if (!businessRepository.existsById(request.id)) {
                throw new AppException(ErrorCode.BUSINESS_NOT_FOUND);
            }
            throw new AppException(ErrorCode.BUSINESS_ALREADY_EXISTS);
        }

        return SuccessResponse.success("Cập nhật doanh nghiệp thành công");
    }

    /**
     * Xóa cứng doanh nghiệp khỏi database.
     * Tối ưu: gộp kiểm tra tồn tại + xóa thành 1 lần truy vấn duy nhất.
     * Xóa cache "businesses" sau khi xóa thành công.
     *
     * @param id ID của doanh nghiệp cần xóa
     * @return SuccessResponse
     */
    @CacheEvict(value = "businesses", allEntries = true)
    public SuccessResponse<String> delete(Integer id) {
        // 1 lần gọi DB duy nhất: xóa và kiểm tra qua rows affected
        int rowsAffected = businessRepository.deleteByIdReturning(id);

        if (rowsAffected == 0) {
            throw new AppException(ErrorCode.BUSINESS_NOT_FOUND);
        }

        return SuccessResponse.success("Xóa doanh nghiệp thành công");
    }

    /**
     * Map Business sang SearchResponse DTO
     */
    private BusinessDto.SearchResponse mapToSearchResponse(Business business) {
        BusinessDto.SearchResponse response = new BusinessDto.SearchResponse();
        response.id = business.getId();
        response.uuid = business.getUuid().toString();
        response.name = business.getName();
        response.address = business.getAddress();
        response.taxCode = business.getTaxCode();
        response.isActive = business.getIsActive();
        return response;
    }


}