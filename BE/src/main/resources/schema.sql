CREATE DATABASE IF NOT EXISTS shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop_db;

CREATE TABLE customers (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(10)  NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    address     TEXT         NOT NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE products (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255)   NOT NULL,
    price          DECIMAL(12, 2) NOT NULL,
    stock_quantity INT            NOT NULL DEFAULT 0,
    status         VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    created_at     DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE orders (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id  BIGINT         NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    status       VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    created_at   DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE order_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT         NOT NULL,
    product_id  BIGINT         NOT NULL,
    quantity    INT            NOT NULL,
    unit_price  DECIMAL(12, 2) NOT NULL,
    line_total  DECIMAL(14, 2) NOT NULL,
    created_at  DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);