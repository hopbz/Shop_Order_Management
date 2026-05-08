package com.example.shop.exception;

public class InvalidOrderStatusException extends RuntimeException {
    public InvalidOrderStatusException(String message) {
        super(message);
    }

    public InvalidOrderStatusException(Long orderId, String status) {
        super("Không thể cập nhật trạng thái đơn hàng " + orderId + " sang " + status);
    }
}
