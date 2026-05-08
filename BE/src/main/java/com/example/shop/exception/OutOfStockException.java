package com.example.shop.exception;

public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String name, int req, int available) {
        super("Sản phẩm '" + name + "' không đủ hàng. Yêu cầu: " + req + ", còn: " + available);
    }
}