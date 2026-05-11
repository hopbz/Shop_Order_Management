# Shop Order Management System

Hệ thống quản lý cửa hàng nội bộ — Backend Spring Boot + Frontend React + MySQL.  
Hỗ trợ quản lý sản phẩm, khách hàng và đơn hàng với giao diện web hiện đại.

---

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| Backend | Java 17, Spring Boot 3.3, Spring Data JPA, Bean Validation |
| Database | MySQL 8 |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7 |
| Deploy | Docker, Docker Compose, Nginx |

---

## Cấu trúc dự án

```
shop/
├── BE/                          # Spring Boot backend
│   ├── src/main/java/com/example/shop/
│   │   ├── config/              # CorsConfig, JpaAuditingConfig
│   │   ├── controller/          # CustomerController, ProductController, OrderController, HealthController
│   │   ├── service/             # Business logic
│   │   ├── repository/          # JPA repositories
│   │   ├── entity/              # Customer, Product, Order, OrderItem
│   │   ├── dto/                 # Request / Response DTOs
│   │   └── exception/           # Custom exceptions + GlobalExceptionHandler
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── FE/                          # React frontend
│   ├── src/
│   │   ├── pages/               # Dashboard, ProductsPage, CustomersPage, OrdersPage, OrderDetailPage, ...
│   │   ├── components/          # Layout, OfflineBanner, EmptyState, UI components
│   │   ├── hooks/               # useToast, useBackendStatus
│   │   ├── services/
│   │   │   └── api.ts           # HTTP client (fetch wrapper + typed API methods)
│   │   └── lib/
│   │       └── utils.ts         # formatCurrency, cn (clsx)
│   ├── .env                     # Local dev — VITE_API_URL=http://localhost:8080/api
│   ├── .env.example             # Mẫu biến môi trường
│   ├── nginx.conf               # Nginx config (SPA routing + API proxy)
│   ├── Dockerfile
│   └── vite.config.ts
│
├── docker-compose.yml           # Orchestration: MySQL + Backend + Frontend
├── .env                         # Biến môi trường cho Docker Compose
├── Shop_API.postman_collection.json
└── README.md
```

---

## Database Schema

```
customers   id | full_name | phone | email | address | created_at | updated_at
products    id | name | price | stock_quantity | status | deleted | created_at | updated_at
orders      id | customer_id | total_amount | status | created_at | updated_at
order_items id | order_id | product_id | quantity | unit_price | line_total | created_at | updated_at
```

**Luồng trạng thái đơn hàng:** `PENDING → CONFIRMED → SHIPPING → COMPLETED / CANCELED`

---

## Chạy local (không Docker)

### Yêu cầu

- Java 17+, Maven 3.9+
- MySQL 8 đang chạy
- Node.js 18+

### 1. Tạo database

```sql
CREATE DATABASE IF NOT EXISTS shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Chạy Backend

```bash
cd BE

# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Mặc định kết nối `localhost:3306`, user `root`, password `root`.  
Sửa trong `BE/src/main/resources/application.properties` hoặc đặt biến môi trường `DB_*`.

Backend sẵn sàng tại: **http://localhost:8080**  
Health check: **http://localhost:8080/api/health**

### 3. Chạy Frontend

```bash
cd FE
npm install
npm run dev
```

Frontend sẵn sàng tại: **http://localhost:3000**

> File `FE/.env` đã có sẵn với `VITE_API_URL=http://localhost:8080/api`.  
> Khi chạy `npm run dev`, Vite đọc file này để biết địa chỉ backend.

---

## Chạy với Docker Compose

### 1. Yêu cầu

- Docker Engine 24+
- Docker Compose v2 (`docker compose` — không phải `docker-compose`)

### 2. Kiểm tra file `.env`

File `.env` ở thư mục gốc đã được cấu hình sẵn. Chỉ cần đổi mật khẩu DB nếu muốn:

```env
DB_PASSWORD=root          # Đổi nếu muốn bảo mật hơn
DB_NAME=shop_db
VITE_API_URL=/api         # KHÔNG đổi — nginx proxy xử lý nội bộ
```

### 3. Build và chạy

```bash
# Lần đầu hoặc sau khi thay đổi code
docker compose up --build -d

# Xem log
docker compose logs -f

# Dừng (giữ data)
docker compose down

# Dừng và xóa DB (reset hoàn toàn)
docker compose down -v
```

### 4. Truy cập

| Dịch vụ | URL |
|---------|-----|
| Frontend (UI) | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Health check | http://localhost:8080/api/health |

> **Cơ chế kết nối trong Docker:**  
> Frontend (Nginx) nhận request từ browser → request tới `/api/...` được proxy nội bộ tới container `backend:8080` → không cần biết IP server.

---

## Deploy lên Cloud (Ubuntu Server)

```bash
# 1. Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# 2. Clone dự án
git clone <your-repo-url> shop
cd shop

# 3. Sửa mật khẩu DB trong .env (tuỳ chọn)
nano .env
# KHÔNG cần đổi VITE_API_URL — nginx proxy tự xử lý

# 4. Build và chạy
docker compose up --build -d

# 5. Kiểm tra
docker compose ps
docker compose logs backend
```

Truy cập UI tại: **http://\<server-ip\>:3000**  
API tại: **http://\<server-ip\>:8080/api**

> Để bảo mật hơn, đứng sau reverse proxy (Nginx/Caddy) với HTTPS và domain riêng.  
> Đổi `DB_PASSWORD` trong `.env` trước khi chạy trên môi trường production.

---

## API Reference

### Health

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/api/health` | Kiểm tra backend hoạt động |

**Response:** `{ "status": "UP" }`

---

### Customers — `/api/customers`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/customers` | Tạo khách hàng mới |
| `GET` | `/api/customers` | Lấy danh sách tất cả |
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

**Response (201):**
```json
{
  "id": 1,
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "a@example.com",
  "address": "Quận 1, TP.HCM",
  "createdAt": "2025-01-01T10:00:00",
  "updatedAt": "2025-01-01T10:00:00"
}
```

---

### Products — `/api/products`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/products` | Tạo sản phẩm mới |
| `GET` | `/api/products` | Danh sách (bỏ qua deleted) |
| `GET` | `/api/products?name=áo` | Tìm kiếm theo tên |
| `GET` | `/api/products/{id}` | Chi tiết sản phẩm |
| `PUT` | `/api/products/{id}` | Cập nhật toàn bộ thông tin |
| `PATCH` | `/api/products/{id}/status` | Đổi trạng thái ACTIVE/INACTIVE |
| `DELETE` | `/api/products/{id}` | **Xóa mềm** — ẩn khỏi danh sách, giữ lịch sử đơn |

**Request tạo/cập nhật sản phẩm:**
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

> **INACTIVE vs Xóa mềm:**
> - `INACTIVE` → Ngừng bán, vẫn thấy trong danh sách quản lý
> - Soft delete → Ẩn hoàn toàn khỏi UI, không đặt hàng được, nhưng `order_items` lịch sử vẫn còn

---

### Orders — `/api/orders`

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/orders` | Tạo đơn hàng |
| `GET` | `/api/orders` | Danh sách tất cả |
| `GET` | `/api/orders?status=PENDING` | Lọc theo trạng thái |
| `GET` | `/api/orders/{id}` | Chi tiết + danh sách items |
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

**Request cập nhật trạng thái:**
```json
{ "status": "CONFIRMED" }
```

---

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
| `status` (order) | `PENDING` \| `CONFIRMED` \| `SHIPPING` \| `COMPLETED` \| `CANCELED` |
| `customerId` | Không null, phải tồn tại trong DB |
| `items` | Không null, không rỗng |
| `quantity` | ≥ 1 và ≤ tồn kho hiện tại |

---

## Business Rules

- Sản phẩm phải `ACTIVE` mới đặt hàng được.
- Số lượng đặt không vượt quá tồn kho.
- Toàn bộ items được validate **trước khi lưu** (all-or-nothing transaction).
- Tạo đơn thành công → trừ tồn kho ngay lập tức.
- Không thể hủy (`CANCELED`) đơn đã `COMPLETED`.
- Sản phẩm chỉ bị xóa mềm, không xóa cứng khỏi DB.

---

## Test Cases gợi ý (Postman)

Import file `Shop_API.postman_collection.json` để chạy nhanh.

| # | Loại | Endpoint | Kỳ vọng |
|---|------|----------|---------|
| 1 | ✅ | `POST /api/customers` (hợp lệ) | 201 + CustomerResponse |
| 2 | ✅ | `POST /api/products` (hợp lệ) | 201 + ProductResponse |
| 3 | ✅ | `POST /api/orders` (2 sản phẩm) | 201, tổng tiền đúng, tồn kho giảm |
| 4 | ✅ | `GET /api/products?name=áo` | 200 + danh sách lọc theo tên |
| 5 | ✅ | `PATCH /api/orders/{id}/status` → CONFIRMED | 200 + status mới |
| 6 | ❌ | `POST /api/customers` email sai | 400 + lỗi validation |
| 7 | ❌ | `POST /api/products` price âm | 400 + lỗi validation |
| 8 | ❌ | `POST /api/orders` customerId không tồn tại | 404 |
| 9 | ❌ | `POST /api/orders` quantity > tồn kho | 400 OutOfStock |
| 10 | ❌ | `PATCH /api/orders/{COMPLETED_id}/status` → CANCELED | 400 Invalid |

---

## Giao diện (Screenshots)

| Trang | Mô tả |
|-------|-------|
| Dashboard | KPI cards (doanh thu, sản phẩm, đơn hàng, khách hàng) + đơn hàng gần đây |
| Sản phẩm | Bảng sản phẩm với tìm kiếm, toggle ACTIVE/INACTIVE, xóa mềm |
| Khách hàng | Form thêm khách hàng (inline) + bảng danh sách |
| Đơn hàng | Lọc theo trạng thái, xem tổng doanh thu |
| Chi tiết đơn | Thông tin khách, danh sách sản phẩm, cập nhật trạng thái |

---

## Biến môi trường

### Root `.env` (Docker Compose)

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `DB_HOST` | `localhost` | Host MySQL (trong Docker: tên service `db`) |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_NAME` | `shop_db` | Tên database |
| `DB_USER` | `root` | User MySQL |
| `DB_PASSWORD` | `root` | Mật khẩu MySQL — **đổi trên production** |
| `VITE_API_URL` | `/api` | URL API cho frontend Docker build — giữ nguyên `/api` |

### `FE/.env` (Local dev — Vite dev server)

| Biến | Giá trị | Mô tả |
|------|---------|-------|
| `VITE_API_URL` | `http://localhost:8080/api` | Địa chỉ backend khi chạy `npm run dev` |
