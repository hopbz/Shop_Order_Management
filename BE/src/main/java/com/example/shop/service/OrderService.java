package com.example.shop.service;

import com.example.shop.dto.request.CreateOrderItemRequest;
import com.example.shop.dto.request.CreateOrderRequest;
import com.example.shop.dto.request.UpdateOrderStatusRequest;
import com.example.shop.dto.response.OrderItemResponse;
import com.example.shop.dto.response.OrderResponse;
import com.example.shop.entity.Order;
import com.example.shop.entity.OrderItem;
import com.example.shop.entity.Product;
import com.example.shop.exception.CustomerNotFoundException;
import com.example.shop.exception.InvalidOrderStatusException;
import com.example.shop.exception.OrderNotFoundException;
import com.example.shop.exception.OutOfStockException;
import com.example.shop.exception.ProductNotFoundException;
import com.example.shop.repository.CustomerRepository;
import com.example.shop.repository.OrderItemRepository;
import com.example.shop.repository.OrderRepository;
import com.example.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException(req.getCustomerId()));

        List<Product> products = new ArrayList<>();
        Map<Long, Integer> requestedQuantities = new HashMap<>();

        for (CreateOrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(itemReq.getProductId()));

            if (product.isDeleted()) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' đã bị xóa khỏi danh mục bán");
            }
            if (!"ACTIVE".equals(product.getStatus())) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' hiện không còn bán");
            }

            int requestedQuantity = requestedQuantities.getOrDefault(product.getId(), 0) + itemReq.getQuantity();
            if (product.getStockQuantity() < requestedQuantity) {
                throw new OutOfStockException(product.getName(), requestedQuantity, product.getStockQuantity());
            }

            requestedQuantities.put(product.getId(), requestedQuantity);
            products.add(product);
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (int i = 0; i < req.getItems().size(); i++) {
            CreateOrderItemRequest itemReq = req.getItems().get(i);
            Product product = products.get(i);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setLineTotal(lineTotal);
            orderItems.add(orderItem);

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        Order order = new Order();
        order.setCustomerId(req.getCustomerId());
        order.setTotalAmount(total);
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrderId(savedOrder.getId());
        }
        List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);

        OrderResponse response = OrderResponse.from(savedOrder);
        response.setItems(savedItems.stream().map(OrderItemResponse::from).collect(Collectors.toList()));
        return response;
    }

    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getByStatus(String status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
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

        if ("COMPLETED".equals(order.getStatus()) && "CANCELED".equals(req.getStatus())) {
            throw new InvalidOrderStatusException("Không thể hủy đơn hàng đã hoàn thành");
        }

        order.setStatus(req.getStatus());
        return buildResponse(orderRepository.save(order));
    }

    private OrderResponse buildResponse(Order order) {
        OrderResponse response = OrderResponse.from(order);
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(OrderItemResponse::from)
                .collect(Collectors.toList());
        response.setItems(items);
        return response;
    }
}
