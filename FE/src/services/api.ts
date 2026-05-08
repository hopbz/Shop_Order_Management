const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

// ─── Types ────────────────────────────────────────────────────
export type Customer = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  status: 'ACTIVE' | 'INACTIVE';
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELED';

export type Order = {
  id: number;
  customerId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type ApiError = {
  status: number;
  message: string;
  errors?: Record<string, string>;
};

// ─── HTTP helper ──────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: res.status,
      message: res.statusText,
    }));
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── API ──────────────────────────────────────────────────────
export const api = {
  // Customers
  getCustomers: () => request<Customer[]>('/customers'),
  getCustomer: (id: number) => request<Customer>(`/customers/${id}`),
  createCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts: (name?: string) => {
    const qs = name ? `?name=${encodeURIComponent(name)}` : '';
    return request<Product[]>(`/products${qs}`);
  },
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createProduct: (data: { name: string; price: number; stockQuantity: number }) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: { name: string; price: number; stockQuantity: number; status?: string }) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateProductStatus: (id: number, status: 'ACTIVE' | 'INACTIVE') =>
    request<Product>(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  softDeleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<Order[]>(`/orders${qs}`);
  },
  getOrder: (id: number) => request<Order>(`/orders/${id}`),
  createOrder: (data: { customerId: number; items: { productId: number; quantity: number }[] }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
