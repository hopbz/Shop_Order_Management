import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Package, DollarSign, Hash } from "lucide-react";
import {
  type ProductFormData,
  normalizeProductForm,
  validateProductForm,
} from "@/lib/validation";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProductFormData>({ name: "", price: "", stockQuantity: "" });

  const syncFieldError = (field: keyof ProductFormData, nextData: ProductFormData) => {
    const nextError = validateProductForm(nextData)[field];
    setErrors((prev) => {
      const next = { ...prev };
      if (nextError) next[field] = nextError;
      else delete next[field];
      return next;
    });
  };

  const setField = (field: keyof ProductFormData, value: string) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);
    if (errors[field]) syncFieldError(field, nextData);
  };

  const handleBlur = (field: keyof ProductFormData) => {
    syncFieldError(field, formData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = normalizeProductForm(formData);
    const validationErrors = validateProductForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormData(payload);
      return;
    }

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

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thêm sản phẩm</h1>
          <p className="text-sm text-slate-500">Điền thông tin để tạo sản phẩm mới</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Package className="h-3.5 w-3.5 text-indigo-400" />
              Tên sản phẩm <span className="text-red-400">*</span>
            </label>
            <input
              value={formData.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="Ví dụ: Áo thun basic"
              className={`input-field w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-indigo-400 focus:outline-none ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
            />
            {errors.name && <p className="flex items-center gap-1 text-xs text-red-500">⚠ {errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                Giá (VND) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1000"
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                onBlur={() => handleBlur("price")}
                placeholder="150000"
                className={`input-field w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-indigo-400 focus:outline-none ${errors.price ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
              />
              {errors.price && <p className="text-xs text-red-500">⚠ {errors.price}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Hash className="h-3.5 w-3.5 text-indigo-400" />
                Số lượng tồn kho <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setField("stockQuantity", e.target.value)}
                onBlur={() => handleBlur("stockQuantity")}
                placeholder="20"
                className={`input-field w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-indigo-400 focus:outline-none ${errors.stockQuantity ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
              />
              {errors.stockQuantity && <p className="text-xs text-red-500">⚠ {errors.stockQuantity}</p>}
            </div>
          </div>

          {(formData.name || formData.price) && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-indigo-400">Xem trước</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-800">{formData.name || "Tên sản phẩm"}</span>
                <span className="text-sm font-bold text-indigo-600">
                  {formData.price
                    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(formData.price))
                    : "--"}
                </span>
              </div>
              <div className="mt-1 text-xs text-indigo-400">Tồn kho: {formData.stockQuantity || "0"} • Trạng thái: ACTIVE</div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-2">
            <Link to="/products" className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200">
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
