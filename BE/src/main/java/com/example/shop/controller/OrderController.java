package com.example.shop.controller;

import com.example.shop.dto.request.*;
import com.example.shop.dto.response.OrderResponse;
import com.example.shop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest req) {
        return orderService.createOrder(req);
    }

    @GetMapping
    public List<OrderResponse> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return orderService.getByStatus(status);
        }
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest req) {
        return orderService.updateStatus(id, req);
    }
}