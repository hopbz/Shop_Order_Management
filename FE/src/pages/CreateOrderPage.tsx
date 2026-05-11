import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, Customer, Product } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Plus, Trash2, ShoppingCart, Users, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  type OrderDraftItem,
  sanitizeIntegerInput,
  validateOrderDraft,
} from "@/lib/validation";

type DraftOrderLine = OrderDraftItem & {
  id: number;
};

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<DraftOrderLine[]>([{ id: 1, productId: "", quantity: "1" }]);
  const [nextItemId, setNextItemId] = useState(2);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getProducts()])
      .then(([customerList, productList]) => {
        setCustomers(customerList);
        setProducts(productList.filter((product) => product.status === "ACTIVE"));
      })
      .catch(() => {});
  }, []);

  const activeItems = items.filter((item) => item.productId);

  const estimatedTotal = activeItems.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === Number(item.productId));
    return sum + (product ? product.price * Number(item.quantity) : 0);
  }, 0);

  const syncDraftErrors = (nextCustomerId: string, nextItems: DraftOrderLine[]) => {
    const nextErrors = validateOrderDraft(nextCustomerId, nextItems, products);
    setErrors((prev) => {
      const merged = { ...prev };
      if (nextErrors.customerId) merged.customerId = nextErrors.customerId;
      else delete merged.customerId;
      if (nextErrors.items) merged.items = nextErrors.items;
      else delete merged.items;
      return merged;
    });
  };

  const updateItem = (itemId: number, field: "productId" | "quantity", value: string) => {
    const normalizedValue = field === "quantity" ? sanitizeIntegerInput(value) : value;
    const nextItems = items.map((item) => (item.id === itemId ? { ...item, [field]: normalizedValue } : item));
    setItems(nextItems);
    if (errors.items || errors.customerId) syncDraftErrors(customerId, nextItems);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: nextItemId, productId: "", quantity: "1" }]);
    setNextItemId((prev) => prev + 1);
  };

  const removeItem = (itemId: number) => {
    const nextItems = items.filter((item) => item.id !== itemId);
    setItems(nextItems);
    if (errors.items || errors.customerId) syncDraftErrors(customerId, nextItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateOrderDraft(customerId, items, products);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const validItems = items.filter((item) => item.productId);
    setErrors({});
    setLoading(true);
    try {
      const order = await api.createOrder({
        customerId: Number(customerId),
        items: validItems.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      });
      toast(`Tạo đơn hàng #${order.id} thành công.`, "success");
      navigate("/orders");
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else toast(err.message || "Lỗi tạo đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((customer) => customer.id === Number(customerId));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/orders"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tạo đơn hàng</h1>
          <p className="text-sm text-slate-500">Chọn khách hàng và sản phẩm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700">Thông tin khách hàng</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Chọn khách hàng <span className="text-red-400">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                const nextCustomerId = e.target.value;
                setCustomerId(nextCustomerId);
                if (errors.customerId || errors.items) syncDraftErrors(nextCustomerId, items);
              }}
              onBlur={() => syncDraftErrors(customerId, items)}
              className={`input-field w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-colors focus:border-indigo-400 focus:outline-none ${errors.customerId ? "border-red-400" : "border-slate-200"}`}
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName} - {customer.phone}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="text-xs text-red-500">⚠ {errors.customerId}</p>}
          </div>

          {selectedCustomer && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                {selectedCustomer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-800">{selectedCustomer.fullName}</p>
                <p className="text-xs text-indigo-500">
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <Package className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Sản phẩm đặt hàng</h2>
            </div>
            <span className="text-xs text-slate-400">{activeItems.length} sản phẩm</span>
          </div>

          {errors.items && <p className="mb-3 text-xs text-red-500">⚠ {errors.items}</p>}

          <div className="space-y-3">
            {items.map((item) => {
              const selectedProduct = products.find((product) => product.id === Number(item.productId));

              return (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-start">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Sản phẩm</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                      onBlur={() => syncDraftErrors(customerId, items)}
                      className="input-field w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:border-indigo-400 focus:outline-none"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map((product) => {
                        const selectedElsewhere = items.some(
                          (candidate) => candidate.id !== item.id && candidate.productId === String(product.id),
                        );

                        return (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={product.stockQuantity === 0 || selectedElsewhere}
                          >
                            {product.name} - {formatCurrency(product.price)} (còn {product.stockQuantity})
                          </option>
                        );
                      })}
                    </select>
                    {selectedProduct && (
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        Giá: {formatCurrency(selectedProduct.price)} • Còn {selectedProduct.stockQuantity}
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-28 md:flex-shrink-0">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct?.stockQuantity ?? 999}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      onBlur={() => syncDraftErrors(customerId, items)}
                      className="input-field w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm transition-colors focus:border-indigo-400 focus:outline-none"
                    />
                    {selectedProduct && (
                      <p className="mt-1 text-right text-xs text-slate-400">
                        = {formatCurrency(selectedProduct.price * Number(item.quantity || 0))}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 md:mt-6 md:flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-indigo-300 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        </div>

        {activeItems.length > 0 && (
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-700">Tổng ước tính</span>
              </div>
              <span className="text-xl font-bold text-indigo-700">{formatCurrency(estimatedTotal)}</span>
            </div>
            <p className="mt-1 text-xs text-indigo-400">{activeItems.length} sản phẩm</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/orders"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
            {loading ? "Đang tạo..." : "Xác nhận đơn hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
