import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Package, DollarSign, Hash, Sparkles } from "lucide-react";
import {
  type ProductFormData,
  normalizeProductForm,
  validateProductForm,
} from "@/lib/validation";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProductFormData>({ name: "", price: "", stockQuantity: "" });

  const syncFieldError = (field: keyof ProductFormData, next: ProductFormData) => {
    const err = validateProductForm(next)[field];
    setErrors(prev => { const n = { ...prev }; err ? n[field] = err : delete n[field]; return n; });
  };

  const setField = (field: keyof ProductFormData, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (errors[field]) syncFieldError(field, next);
  };

  const handleBlur = (field: keyof ProductFormData) => syncFieldError(field, formData);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = normalizeProductForm(formData);
    const validationErrors = validateProductForm(payload);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); setFormData(payload); return; }

    setLoading(true);
    setErrors({});
    try {
      await api.createProduct({
        name: payload.name,
        price: Number(payload.price),
        stockQuantity: Number(payload.stockQuantity),
      });
      toast("Tạo sản phẩm thành công.", "success");
      navigate("/products");
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else toast(err.message || "Đã xảy ra lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `input-field w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none ${
      errors[field]
        ? "border-red-300 bg-red-50 text-red-900"
        : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-400"
    }`;

  const hasPreview = Boolean(formData.name || formData.price);
  const priceNum   = Number(formData.price) || 0;
  const formatted  = priceNum > 0
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceNum)
    : null;

  return (
    <div className="mx-auto max-w-xl space-y-5">

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Thêm sản phẩm</h1>
          <p className="text-sm text-slate-400">Điền thông tin để tạo sản phẩm mới</p>
        </div>
      </div>

      {/* Form card */}
      <div className="page-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product name */}
          <Field label="Tên sản phẩm" error={errors.name}>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={formData.name}
                onChange={e => setField("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Ví dụ: Áo thun basic trắng"
                className={`${inputCls("name")} pl-10`}
              />
            </div>
          </Field>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Giá bán (VND)" hint="≥ 1 đồng" error={errors.price}>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={formData.price}
                  onChange={e => setField("price", e.target.value)}
                  onBlur={() => handleBlur("price")}
                  placeholder="150000"
                  className={`${inputCls("price")} pl-10`}
                />
              </div>
            </Field>

            <Field label="Tồn kho ban đầu" hint="≥ 0" error={errors.stockQuantity}>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={e => setField("stockQuantity", e.target.value)}
                  onBlur={() => handleBlur("stockQuantity")}
                  placeholder="20"
                  className={`${inputCls("stockQuantity")} pl-10`}
                />
              </div>
            </Field>
          </div>

          {/* Preview */}
          {hasPreview && (
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Xem trước</p>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Package className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-indigo-800">
                      {formData.name || "Tên sản phẩm"}
                    </p>
                    <p className="mt-0.5 text-xs text-indigo-400">
                      Tồn kho: {formData.stockQuantity || "0"} · Trạng thái: <span className="font-medium">ACTIVE</span>
                    </p>
                  </div>
                </div>
                <p className="flex-shrink-0 text-base font-bold text-indigo-700">
                  {formatted ?? "—"}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/products"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md"
            >
              {loading ? "Đang lưu..." : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
