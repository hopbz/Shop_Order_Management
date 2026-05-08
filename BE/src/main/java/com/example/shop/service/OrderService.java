package com.example.shop.service;

import com.example.shop.dto.request.*;
import com.example.shop.dto.response.*;
import com.example.shop.entity.*;
import com.example.shop.exception.*;
import com.example.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req) {
        // 1. Validate customer
        customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException(req.getCustomerId()));

        // 2. Validate toàn bộ items trước khi lưu bất cứ thứ gì
        List<Product> products = new ArrayList<>();
        for (CreateOrderItemRequest itemReq : req.getItems()) {
            Product p = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(itemReq.getProductId()));
            if (!"ACTIVE".equals(p.getStatus())) {
                throw new RuntimeException("Sản phẩm '" + p.getName() + "' hiện không còn bán");
            }
            if (p.getStockQuantity() < itemReq.getQuantity()) {
                throw new OutOfStockException(p.getName(), itemReq.getQuantity(), p.getStockQuantity());
            }
            products.add(p);
        }

        // 3. Tính tổng, tạo order items
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (int i = 0; i < req.getItems().size(); i++) {
            CreateOrderItemRequest itemReq = req.getItems().get(i);
            Product p = products.get(i);

            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setProductId(p.getId());
            oi.setQuantity(itemReq.getQuantity());
            oi.setUnitPrice(p.getPrice());
            oi.setLineTotal(lineTotal);
            orderItems.add(oi);

            // 4. Trừ tồn kho
            p.setStockQuantity(p.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(p);
        }

        // 5. Lưu order
        Order order = new Order();
        order.setCustomerId(req.getCustomerId());
        order.setTotalAmount(total);
        order.setStatus("PENDING");
        Order saved = orderRepository.save(order);

        // 6. Gắn orderId rồi lưu items
        for (OrderItem oi : orderItems) {
            oi.setOrderId(saved.getId());
        }
        List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);

        // 7. Build response
        OrderResponse response = OrderResponse.from(saved);
        response.setItems(savedItems.stream().map(OrderItemResponse::from).collect(Collectors.toList()));
        return response;
    }

    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream()
                .map(this::buildResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getByStatus(String status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::buildResponse).collect(Collectors.toList());
    }

    public OrderResponse getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return buildResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest req) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        // Nâng cao: không cho hủy đơn đã COMPLETED
        if ("COMPLETED".equals(order.getStatus()) && "CANCELED".equals(req.getStatus())) {
            throw new InvalidOrderStatusException("Không thể hủy đơn hàng đã hoàn thành");
        }

        order.setStatus(req.getStatus());
        return OrderResponse.from(orderRepository.save(order));
    }

    private OrderResponse buildResponse(Order order) {
        OrderResponse r = OrderResponse.from(order);
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                .stream().map(OrderItemResponse::from).collect(Collectors.toList());
        r.setItems(items);
        return r;
    }
}