package com.example.shop.exception;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long id) {
        super("Không tìm thấy hóa đơn với id:" + id);
    }
}
