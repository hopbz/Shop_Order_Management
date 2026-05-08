package com.example.shop.controller;

import com.example.shop.dto.request.*;
import com.example.shop.dto.response.ProductResponse;
import com.example.shop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest req) {
        return productService.create(req);
    }

    @GetMapping
    public List<ProductResponse> getAll(@RequestParam(required = false) String name) {
        if (name != null && !name.isBlank()) {
            return productService.searchByName(name);
        }
        return productService.getAll();
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest req) {
        return productService.update(id, req);
    }

    @PatchMapping("/{id}/status")
    public ProductResponse updateStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest req) {
        return productService.updateStatus(id, req);
    }

    /**
     * Soft delete: ẩn sản phẩm khỏi danh sách nhưng giữ lịch sử đơn hàng.
     * Dùng khi muốn XÓA hẳn khỏi giao diện (khác với INACTIVE chỉ ngừng bán).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable Long id) {
        productService.softDelete(id);
    }
}
