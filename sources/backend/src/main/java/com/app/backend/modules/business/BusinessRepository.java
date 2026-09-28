package com.app.backend.modules.business;

import com.app.backend.entities.Business;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Integer> {

    /**
     * Tìm doanh nghiệp đang hoạt động theo ID
     *
     * @param id ID của doanh nghiệp
     * @return Optional<Business>
     */
    Optional<Business> findByIdAndIsActiveTrue(Integer id);

    /**
     * Tìm kiếm doanh nghiệp theo tên, mã số thuế, địa chỉ
     * Có thể tìm theo 1 hoặc nhiều tiêu chí
     *
     * @param name Tên doanh nghiệp (có thể null)
     * @param taxCode Mã số thuế (có thể null)
     * @param address Địa chỉ (có thể null)
     * @return List<Business>
     */
    @Query("SELECT b FROM Business b WHERE " +
            "(:name IS NULL OR :name = '' OR LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))) OR " +
            "(:taxCode IS NOT NULL AND :taxCode != '' AND LOWER(b.taxCode) LIKE LOWER(CONCAT('%', :taxCode, '%'))) OR " +
            "(:address IS NOT NULL AND :address != '' AND LOWER(b.address) LIKE LOWER(CONCAT('%', :address, '%')))")
    List<Business> searchBusiness(@Param("name") String name, @Param("taxCode") String taxCode, @Param("address") String address);

    /**
     * Kiểm tra mã số thuế đã tồn tại trong hệ thống hay chưa
     *
     * @param taxCode Mã số thuế của doanh nghiệp
     * @return boolean
     */
    boolean existsByTaxCode(String taxCode);

    /**
     * Tạo doanh nghiệp mới
     *
     * @param name Tên doanh nghiệp
     * @param taxCode Mã số thuế
     * @param address Địa chỉ
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO business (name, tax_code, address) VALUES (:name, :taxCode, :address)",
            nativeQuery = true)
    int insert(
            @Param("name") String name,
            @Param("taxCode") String taxCode,
            @Param("address") String address
    );

    /**
     * Cập nhật doanh nghiệp
     *
     * @param id ID của doanh nghiệp
     * @param name Tên doanh nghiệp
     * @param taxCode Mã số thuế
     * @param address Địa chỉ
     * @param is_Active Trang thai
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE business SET name = :name, tax_code = :taxCode, address = :address, is_active = :is_Active WHERE id = :id", nativeQuery = true)
    int update(
        @Param("id") Integer id,
        @Param("name") String name,
        @Param("taxCode") String taxCode,
        @Param("address") String address,
        @Param("is_Active") boolean is_Active
    );

    /**
     * Cập nhật doanh nghiệp, chỉ thực hiện nếu taxCode mới không bị trùng với doanh nghiệp khác.
     * Gộp kiểm tra taxCode conflict + update thành 1 lần truy vấn duy nhất.
     *
     * @param id       ID doanh nghiệp cần cập nhật
     * @param name     Tên mới
     * @param taxCode  Mã số thuế mới
     * @param address  Địa chỉ mới
     * @param isActive Trạng thái
     * @return Số dòng bị ảnh hưởng (0 = không tìm thấy hoặc taxCode bị trùng)
     */
    @Modifying
    @Transactional
    @Query(value = """
            UPDATE business
            SET name = :name, tax_code = :taxCode, address = :address, is_active = :isActive
            WHERE id = :id
              AND NOT EXISTS (
                  SELECT 1 FROM business
                  WHERE tax_code = :taxCode AND id <> :id
              )
            """, nativeQuery = true)
    int updateIfTaxCodeNotConflict(
            @Param("id") Integer id,
            @Param("name") String name,
            @Param("taxCode") String taxCode,
            @Param("address") String address,
            @Param("isActive") boolean isActive
    );

    /**
     * Xóa cứng doanh nghiệp theo ID, trả về số dòng bị xóa.
     * Gộp kiểm tra tồn tại + xóa thành 1 lần truy vấn duy nhất.
     *
     * @param id ID doanh nghiệp cần xóa
     * @return Số dòng bị ảnh hưởng (0 = không tìm thấy)
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM business WHERE id = :id", nativeQuery = true)
    int deleteByIdReturning(@Param("id") Integer id);
}