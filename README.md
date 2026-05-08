# Shop Order Management System

Hệ thống quản lý cửa hàng nội bộ — Backend Spring Boot + Frontend React + MySQL.

---

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| Backend | Java 17, Spring Boot 3.3, Spring Data JPA, Validation |
| Database | MySQL 8 |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Deploy | Docker, Docker Compose |

---

## Cấu trúc dự án

```
shop/
├── BE/                    # Spring Boot backend
│   ├── src/main/java/com/example/shop/
│   │   ├── config/        # CorsConfig, JpaAuditingConfig
│   │   ├── controller/    # REST controllers
│   │   ├── service/       # Business logic
│   │   ├── repository/    # JPA repositories
│   │   ├── entity/        # JPA entities
│   │   ├── dto/           # Request / Response DTOs
│   │   └── exception/     # Custom exceptions + GlobalExceptionHandler
│   ├── Dockerfile
│   └── pom.xml
├── FE/                    # React frontend
│   ├── src/
│   │   ├── pages/         # Dashboard, Products, Orders, Customers
│   │   ├── hooks/         # useToast
│   │   ├── services/      # api.ts (HTTP client)
│   │   └── components/    # Layout, UI components
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env                   # Biến môi trường (copy từ đây)
└── README.md
```

---

## Database Schema

```
customers   id | full_name | phone | email | address | created_at | updated_at
products    id | name | price | stock_quantity | status | created_at | updated_at
orders      id | customer_id | total_amount | status | created_at | updated_at
order_items id | order_id | product_id | quantity | unit_price | line_total | created_at | updated_at
```

**Order status:** `PENDING → CONFIRMED → SHIPPING → COMPLETED / CANCELED`

---

## Chạy local (không Docker)

### 1. Yêu cầu

- Java 17+
- Maven 3.9+
- MySQL 8 đang chạy
- Node.js 18+

### 2. Tạo database

```sql
CREATE DATABASE IF NOT EXISTS shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Chạy Backend

```bash
cd BE

# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

> Mặc định kết nối `localhost:3306`, user `root`, password `root`.
> Sửa trong `src/main/resources/application.properties` hoặc set biến môi trường.

API sẵn sàng tại: **http://localhost:8080**

### 4. Chạy Frontend

```bash
cd FE
npm install
npm run dev
```

UI sẵn sàng tại: **http://localhost:3000**

---

## Chạy với Docker Compose

### 1. Cấu hình môi trường

Chỉnh file `.env` nếu cần (mặc định đã đủ để chạy local):

```env
DB_PASSWORD=root
DB_NAME=shop_db
VITE_API_URL=http://localhost:8080/api
```

### 2. Build và chạy

```bash
docker-compose up --build
```

| Dịch vụ | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| MySQL | localhost:3306 |

### 3. Dừng

```bash
docker-compose down          # Giữ data
docker-compose down -v       # Xóa cả volume (reset DB)
```

---

## API Reference

### Customers — `/api/customers`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/customers` | Tạo khách hàng mới |
| `GET` | `/api/customers` | Lấy danh sách |
| `GET` | `/api/customers/{id}` | Chi tiết khách hàng |

**Request tạo khách hàng:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "a@example.com",
  "address": "Quận 1, TP.HCM"
}
```

### Products — `/api/products`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/products` | Tạo sản phẩm |
| `GET` | `/api/products` | Danh sách (có `?name=` để tìm) |
| `GET` | `/api/products/{id}` | Chi tiết |
| `PUT` | `/api/products/{id}` | Cập nhật toàn bộ |
| `PATCH` | `/api/products/{id}/status` | Đổi trạng thái (ACTIVE/INACTIVE) |
| `DELETE` | `/api/products/{id}` | **Xóa mềm** — ẩn khỏi list, giữ lịch sử đơn hàng |

> **Phân biệt INACTIVE vs Soft Delete:**
> - `INACTIVE` = Ngừng bán nhưng vẫn hiển thị trong danh sách quản lý
> - `deleted=true` = Ẩn hoàn toàn khỏi giao diện, không thể đặt hàng, nhưng `order_items` lịch sử vẫn còn

**Request tạo sản phẩm:**
```json
{
  "name": "Áo thun basic",
  "price": 150000,
  "stockQuantity": 20
}
```

**Request đổi trạng thái:**
```json
{ "status": "INACTIVE" }
```

### Orders — `/api/orders`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/orders` | Tạo đơn hàng |
| `GET` | `/api/orders` | Danh sách (có `?status=PENDING` để lọc) |
| `GET` | `/api/orders/{id}` | Chi tiết + items |
| `PATCH` | `/api/orders/{id}/status` | Cập nhật trạng thái |

**Request tạo đơn hàng:**
```json
{
  "customerId": 1,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

### Error Response

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "phone": "Số điện thoại phải đúng 10 chữ số",
    "email": "Email không đúng định dạng"
  }
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `fullName` | Không được rỗng |
| `phone` | Đúng 10 chữ số (`^[0-9]{10}$`) |
| `email` | Đúng định dạng email |
| `address` | Không được rỗng |
| `price` | > 0 |
| `stockQuantity` | ≥ 0 |
| `status` (product) | `ACTIVE` hoặc `INACTIVE` |
| `status` (order) | `PENDING\|CONFIRMED\|SHIPPING\|COMPLETED\|CANCELED` |
| `customerId` | Không null, phải tồn tại |
| `items` | Không null, không rỗng |
| `quantity` | ≥ 1 và ≤ tồn kho |

---

## Business Rules

- Sản phẩm phải `ACTIVE` mới đặt hàng được.
- Số lượng đặt không vượt quá tồn kho.
- Toàn bộ items được validate TRƯỚC khi lưu (all-or-nothing).
- Tạo đơn thành công → trừ tồn kho ngay.
- Không thể hủy đơn đã `COMPLETED`.
- Sản phẩm không bị xóa cứng, chỉ chuyển `INACTIVE`.

---

## Test Cases Gợi Ý (Postman)

| # | Loại | Endpoint | Kỳ vọng |
|---|------|----------|---------|
| 1 | ✅ | `POST /api/customers` (hợp lệ) | 201 + CustomerResponse |
| 2 | ✅ | `POST /api/products` (hợp lệ) | 201 + ProductResponse |
| 3 | ✅ | `POST /api/orders` (2 sản phẩm) | 201, tổng tiền đúng, tồn kho giảm |
| 4 | ✅ | `GET /api/products?name=áo` | 200 + list lọc theo tên |
| 5 | ✅ | `PATCH /api/orders/{id}/status` → CONFIRMED | 200 + status mới |
| 6 | ❌ | `POST /api/customers` email sai | 400 + lỗi validation |
| 7 | ❌ | `POST /api/products` price âm | 400 + lỗi validation |
| 8 | ❌ | `POST /api/orders` customerId không tồn tại | 404 |
| 9 | ❌ | `POST /api/orders` quantity > tồn kho | 400 OutOfStock |
| 10 | ❌ | `PATCH /api/orders/{COMPLETED_id}/status` → CANCELED | 400 Invalid |

---

## Deploy lên Cloud (VD: Ubuntu Server)

```bash
# 1. Cài Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo apt install docker-compose-plugin

# 2. Clone dự án
git clone <your-repo-url> shop && cd shop

# 3. Sửa .env
nano .env
# Đổi VITE_API_URL=http://<server-ip>:8080/api

# 4. Build và chạy
docker compose up -d --build

# 5. Kiểm tra
docker compose ps
docker compose logs backend
```
