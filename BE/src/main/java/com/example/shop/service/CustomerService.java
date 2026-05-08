package com.example.shop.service;

import com.example.shop.dto.request.CreateCustomerRequest;
import com.example.shop.dto.response.CustomerResponse;
import com.example.shop.entity.Customer;
import com.example.shop.exception.CustomerNotFoundException;
import com.example.shop.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerResponse create(CreateCustomerRequest req) {
        Customer c = new Customer();
        c.setFullName(req.getFullName());
        c.setPhone(req.getPhone());
        c.setEmail(req.getEmail());
        c.setAddress(req.getAddress());
        return CustomerResponse.from(customerRepository.save(c));
    }

    public List<CustomerResponse> getAll() {
        return customerRepository.findAll()
                .stream().map(CustomerResponse::from).collect(Collectors.toList());
    }

    public CustomerResponse getById(Long id) {
        return CustomerResponse.from(
                customerRepository.findById(id).orElseThrow(() -> new CustomerNotFoundException(id)));
    }
}