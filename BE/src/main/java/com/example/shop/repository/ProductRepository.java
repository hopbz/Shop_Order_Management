package com.example.shop.repository;

import com.example.shop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Chỉ lấy sản phẩm chưa bị xóa mềm
    List<Product> findByDeletedFalse();

    List<Product> findByDeletedFalseAndNameContainingIgnoreCase(String name);

    // Lấy theo id, kể cả đã xóa mềm (dùng khi tạo order để validate)
    Optional<Product> findByIdAndDeletedFalse(Long id);
}
