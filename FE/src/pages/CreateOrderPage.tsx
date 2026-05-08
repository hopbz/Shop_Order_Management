import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, Customer, Product } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Plus, Trash2, ShoppingCart, Users, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: string }[]>([
    { productId: "", quantity: "1" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getProducts()])
      .then(([c, p]) => {
        setCustomers(c);
        setProducts(p.filter(p => p.status === "ACTIVE"));
      })
      .catch(() => { /* backend offline — selects stay empty */ });
  }, []);

  const activeItems = items.filter(i => i.productId);

  const estimatedTotal = activeItems.reduce((sum, item) => {
    const p = products.find(p => p.id === Number(item.productId));
    return sum + (p ? p.price * Number(item.quantity) : 0);
  }, 0);

  const updateItem = (index: number, field: string, value: string) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validItems = items.filter(i => i.productId);
    if (!customerId) { setErrors({ customerId: "Vui lòng chọn khách hàng" }); return; }
    if (validItems.length === 0) { setErrors({ items: "Vui lòng thêm ít nhất 1 sản phẩm" }); return; }

    setLoading(true);
    try {
      const order = await api.createOrder({
        customerId: Number(customerId),
        items: validItems.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
      });
      toast(`Tạo đơn hàng #${order.id} thành công!`, "success");
      navigate("/orders");
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else toast(err.message || "Lỗi tạo đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === Number(customerId));

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/orders" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tạo đơn hàng</h1>
          <p className="text-slate-500 text-sm">Chọn khách hàng và sản phẩm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="font-semibold text-slate-700 text-sm">Thông tin khách hàng</h2>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Chọn khách hàng <span className="text-red-400">*</span></label>
            <select
              value={customerId}
              onChange={e => { setCustomerId(e.target.value); if (errors.customerId) setErrors(p => { const e = {...p}; delete e.customerId; return e; }); }}
              className={`input-field w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:border-indigo-400 bg-white ${errors.customerId ? "border-red-400" : "border-slate-200"}`}
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} — {c.phone}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-xs text-red-500">⚠ {errors.customerId}</p>}
          </div>
          {selectedCustomer && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {selectedCustomer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-800">{selectedCustomer.fullName}</p>
                <p className="text-xs text-indigo-500">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
              <h2 className="font-semibold text-slate-700 text-sm">Sản phẩm đặt hàng</h2>
            </div>
            <span className="text-xs text-slate-400">{activeItems.length} sản phẩm</span>
          </div>

          {errors.items && <p className="text-xs text-red-500 mb-3">⚠ {errors.items}</p>}

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === Number(item.productId));
              return (
                <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Sản phẩm</label>
                    <select
                      value={item.productId}
                      onChange={e => updateItem(index, "productId", e.target.value)}
                      className="input-field w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 transition-colors"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                          {p.name} — {formatCurrency(p.price)} (còn {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                    {selectedProduct && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                        Giá: {formatCurrency(selectedProduct.price)} • Còn {selectedProduct.stockQuantity}
                      </p>
                    )}
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct?.stockQuantity ?? 999}
                      value={item.quantity}
                      onChange={e => updateItem(index, "quantity", e.target.value)}
                      className="input-field w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 transition-colors text-center"
                    />
                    {selectedProduct && (
                      <p className="text-xs text-slate-400 mt-1 text-right">
                        = {formatCurrency(selectedProduct.price * Number(item.quantity || 0))}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                    className="mt-6 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setItems([...items, { productId: "", quantity: "1" }])}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </button>
        </div>

        {/* Summary */}
        {activeItems.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-700">Tổng ước tính</span>
              </div>
              <span className="text-xl font-bold text-indigo-700">{formatCurrency(estimatedTotal)}</span>
            </div>
            <p className="text-xs text-indigo-400 mt-1">{activeItems.length} sản phẩm</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/orders" className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md disabled:opacity-60"
          >
            <ShoppingCart className="w-4 h-4" />
            {loading ? "Đang tạo..." : "Xác nhận đơn hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
