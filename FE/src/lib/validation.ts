import type { Product } from "@/services/api";

export type CustomerFormData = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

export type ProductFormData = {
  name: string;
  price: string;
  stockQuantity: string;
};

export type OrderDraftItem = {
  productId: string;
  quantity: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizePhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function sanitizeIntegerInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function normalizeCustomerForm(data: CustomerFormData): CustomerFormData {
  return {
    fullName: data.fullName.trim(),
    phone: sanitizePhoneNumber(data.phone),
    email: data.email.trim(),
    address: data.address.trim(),
  };
}

export function validateCustomerForm(data: CustomerFormData) {
  const normalized = normalizeCustomerForm(data);
  const errors: Partial<Record<keyof CustomerFormData, string>> = {};

  if (!normalized.fullName) errors.fullName = "Họ và tên không được để trống.";
  if (!normalized.phone) errors.phone = "Số điện thoại không được để trống.";
  else if (!/^\d{10}$/.test(normalized.phone)) errors.phone = "Số điện thoại phải đúng 10 chữ số.";
  if (!normalized.email) errors.email = "Email không được để trống.";
  else if (!EMAIL_REGEX.test(normalized.email)) errors.email = "Email không đúng định dạng.";
  if (!normalized.address) errors.address = "Địa chỉ không được để trống.";

  return errors;
}

export function normalizeProductForm(data: ProductFormData): ProductFormData {
  return {
    name: data.name.trim(),
    price: data.price.trim(),
    stockQuantity: data.stockQuantity.trim(),
  };
}

export function validateProductForm(data: ProductFormData) {
  const normalized = normalizeProductForm(data);
  const errors: Partial<Record<keyof ProductFormData, string>> = {};
  const price = Number(normalized.price);
  const stockQuantity = Number(normalized.stockQuantity);

  if (!normalized.name) errors.name = "Tên sản phẩm không được để trống.";
  if (!normalized.price) errors.price = "Giá không được để trống.";
  else if (!Number.isFinite(price) || price <= 0) errors.price = "Giá phải lớn hơn 0.";
  if (!normalized.stockQuantity) errors.stockQuantity = "Số lượng tồn kho không được để trống.";
  else if (!Number.isInteger(stockQuantity) || stockQuantity < 0) errors.stockQuantity = "Số lượng tồn kho không được âm.";

  return errors;
}

export function validateOrderDraft(customerId: string, items: OrderDraftItem[], products: Product[]) {
  const errors: Record<string, string> = {};

  if (!customerId) errors.customerId = "Vui lòng chọn khách hàng.";

  const selectedItems = items.filter((item) => item.productId);
  if (selectedItems.length === 0) {
    errors.items = "Vui lòng thêm ít nhất 1 sản phẩm.";
    return errors;
  }

  const groupedQuantities = new Map<number, number>();

  for (const item of selectedItems) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const product = products.find((candidate) => candidate.id === productId);

    if (!product) {
      errors.items = "Có sản phẩm không còn tồn tại. Hãy chọn lại.";
      return errors;
    }
    if (!item.quantity) {
      errors.items = `Vui lòng nhập số lượng cho "${product.name}".`;
      return errors;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.items = `Số lượng cho "${product.name}" phải từ 1 trở lên.`;
      return errors;
    }

    groupedQuantities.set(productId, (groupedQuantities.get(productId) ?? 0) + quantity);
  }

  for (const [productId, quantity] of groupedQuantities.entries()) {
    const product = products.find((candidate) => candidate.id === productId);
    if (product && quantity > product.stockQuantity) {
      errors.items = `Tổng số lượng "${product.name}" vượt quá tồn kho hiện có.`;
      return errors;
    }
  }

  return errors;
}
