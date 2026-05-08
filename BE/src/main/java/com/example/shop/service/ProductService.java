package com.example.shop.service;

import com.example.shop.dto.request.*;
import com.example.shop.dto.response.ProductResponse;
import com.example.shop.entity.Product;
import com.example.shop.exception.ProductNotFoundException;
import com.example.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductResponse create(CreateProductRequest req) {
        Product p = new Product();
        p.setName(req.getName());
        p.setPrice(req.getPrice());
        p.setStockQuantity(req.getStockQuantity());
        p.setStatus("ACTIVE");
        p.setDeleted(false);
        return ProductResponse.from(productRepository.save(p));
    }

    public List<ProductResponse> getAll() {
        return productRepository.findByDeletedFalse()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> searchByName(String name) {
        return productRepository.findByDeletedFalseAndNameContainingIgnoreCase(name)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public ProductResponse getById(Long id) {
        return ProductResponse.from(findOrThrow(id));
    }

    public ProductResponse update(Long id, UpdateProductRequest req) {
        Product p = findOrThrow(id);
        p.setName(req.getName());
        p.setPrice(req.getPrice());
        p.setStockQuantity(req.getStockQuantity());
        if (req.getStatus() != null) {
            p.setStatus(req.getStatus());
        }
        return ProductResponse.from(productRepository.save(p));
    }

    public ProductResponse updateStatus(Long id, UpdateProductStatusRequest req) {
        Product p = findOrThrow(id);
        p.setStatus(req.getStatus());
        return ProductResponse.from(productRepository.save(p));
    }

    /**
     * Xóa mềm: đánh dấu deleted=true, ẩn khỏi danh sách nhưng giữ lịch sử đơn hàng.
     * Khác với INACTIVE (ngừng bán nhưng vẫn hiển thị).
     */
    public void softDelete(Long id) {
        Product p = findOrThrow(id);
        p.setDeleted(true);
        p.setStatus("INACTIVE");
        productRepository.save(p);
    }

    private Product findOrThrow(Long id) {
        return productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    // Dùng nội bộ khi tạo order (cần tìm theo id không qua deleted filter để validate)
    public Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}
