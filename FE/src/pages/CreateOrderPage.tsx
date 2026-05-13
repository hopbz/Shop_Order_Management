import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, Customer, Product } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Plus, Trash2, ShoppingCart, Users, Package, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  type OrderDraftItem,
  sanitizeIntegerInput,
  validateOrderDraft,
} from "@/lib/validation";

type DraftOrderLine = OrderDraftItem & { id: number };

function SectionHeader({ icon: Icon, title, sub, iconBg, iconColor }: {
  icon: React.ElementType; title: string; sub?: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [customerId,  setCustomerId]  = useState("");
  const [items,       setItems]       = useState<DraftOrderLine[]>([{ id: 1, productId: "", quantity: "1" }]);
  const [nextItemId,  setNextItemId]  = useState(2);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getProducts()])
      .then(([cl, pl]) => {
        setCustomers(cl);
        setProducts(pl.filter(p => p.status === "ACTIVE"));
      })
      .catch(() => {});
  }, []);

  const activeItems = items.filter(i => i.productId);

  const estimatedTotal = activeItems.reduce((sum, item) => {
    const p = products.find(c => c.id === Number(item.productId));
    return sum + (p ? p.price * Number(item.quantity) : 0);
  }, 0);

  const syncErrors = (cid: string, nextItems: DraftOrderLine[]) => {
    const errs = validateOrderDraft(cid, nextItems, products);
    setErrors(prev => {
      const m = { ...prev };
      errs.customerId ? m.customerId = errs.customerId : delete m.customerId;
      errs.items ? m.items = errs.items : delete m.items;
      return m;
    });
  };

  const updateItem = (itemId: number, field: "productId" | "quantity", value: string) => {
    const v = field === "quantity" ? sanitizeIntegerInput(value) : value;
    const next = items.map(i => i.id === itemId ? { ...i, [field]: v } : i);
    setItems(next);
    if (errors.items || errors.customerId) syncErrors(customerId, next);
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: nextItemId, productId: "", quantity: "1" }]);
    setNextItemId(prev => prev + 1);
  };

  const removeItem = (itemId: number) => {
    const next = items.filter(i => i.id !== itemId);
    setItems(next);
    if (errors.items || errors.customerId) syncErrors(customerId, next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateOrderDraft(customerId, items, products);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const validItems = items.filter(i => i.productId);
    setErrors({});
    setLoading(true);
    try {
      const order = await api.createOrder({
        customerId: Number(customerId),
        items: validItems.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
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

  const selectedCustomer = customers.find(c => c.id === Number(customerId));

  const selectCls = (hasError: boolean) =>
    `input-field w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-colors focus:outline-none ${
      hasError ? "border-red-300" : "border-slate-200 focus:border-indigo-400"
    }`;

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link
          to="/orders"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tạo đơn hàng</h1>
          <p className="text-sm text-slate-400">Chọn khách hàng và sản phẩm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Customer */}
        <div className="page-card p-5">
          <SectionHeader icon={Users} title="Khách hàng" sub="Chọn người đặt hàng" iconBg="bg-indigo-50" iconColor="text-indigo-500" />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Chọn khách hàng <span className="normal-case font-normal text-red-400">*</span>
            </label>
            <select
              value={customerId}
              onChange={e => {
                const v = e.target.value;
                setCustomerId(v);
                if (errors.customerId || errors.items) syncErrors(v, items);
              }}
              onBlur={() => syncErrors(customerId, items)}
              className={selectCls(Boolean(errors.customerId))}
            >
              <option value="">— Chọn khách hàng —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} · {c.phone}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-xs text-red-500">⚠ {errors.customerId}</p>}
          </div>

          {selectedCustomer && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-indigo-50 p-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white shadow-sm">
                {selectedCustomer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-800">{selectedCustomer.fullName}</p>
                <p className="text-xs text-indigo-400">{selectedCustomer.email} · {selectedCustomer.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="page-card p-5">
          <SectionHeader
            icon={Package} title="Sản phẩm đặt hàng"
            sub={`${activeItems.length} mặt hàng đã chọn`}
            iconBg="bg-emerald-50" iconColor="text-emerald-600"
          />

          {errors.items && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
              ⚠ {errors.items}
            </div>
          )}

          <div className="space-y-3">
            {items.map(item => {
              const selProd = products.find(p => p.id === Number(item.productId));
              return (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:flex-row md:items-start">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sản phẩm</label>
                    <select
                      value={item.productId}
                      onChange={e => updateItem(item.id, "productId", e.target.value)}
                      onBlur={() => syncErrors(customerId, items)}
                      className="input-field w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    >
                      <option value="">— Chọn sản phẩm —</option>
                      {products.map(p => {
                        const usedElsewhere = items.some(x => x.id !== item.id && x.productId === String(p.id));
                        return (
                          <option key={p.id} value={p.id} disabled={p.stockQuantity === 0 || usedElsewhere}>
                            {p.name} · {formatCurrency(p.price)} (còn {p.stockQuantity})
                          </option>
                        );
                      })}
                    </select>
                    {selProd && (
                      <p className="text-xs text-emerald-600 font-medium">
                        {formatCurrency(selProd.price)} · Tồn: {selProd.stockQuantity}
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-1 md:w-28 md:flex-shrink-0">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      max={selProd?.stockQuantity ?? 999}
                      value={item.quantity}
                      onChange={e => updateItem(item.id, "quantity", e.target.value)}
                      onBlur={() => syncErrors(customerId, items)}
                      className="input-field w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm focus:outline-none focus:border-indigo-400"
                    />
                    {selProd && (
                      <p className="text-right text-xs font-medium text-slate-500">
                        = {formatCurrency(selProd.price * Number(item.quantity || 0))}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center self-start rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 md:mt-6"
                    title="Xóa dòng này"
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
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-400 transition-all hover:border-indigo-300 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm khác
          </button>
        </div>

        {/* Total */}
        {activeItems.length > 0 && (
          <div className="page-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">Tổng đơn hàng</span>
              </div>
              <span className="text-xs text-slate-400">{activeItems.length} sản phẩm</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-slate-500">Tổng ước tính</span>
              <span className="text-xl font-bold text-indigo-600">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/orders"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            <ShoppingCart className="h-4 w-4" />
            {loading ? "Đang tạo..." : "Xác nhận đơn hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
