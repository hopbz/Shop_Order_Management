import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Package, DollarSign, Hash } from "lucide-react";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: "", price: "", stockQuantity: "" });

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await api.createProduct({
        name: formData.name,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
      });
      toast("Tạo sản phẩm thành công!", "success");
      navigate("/products");
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else toast(err.message || "Đã xảy ra lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/products" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thêm sản phẩm</h1>
          <p className="text-slate-500 text-sm">Điền thông tin để tạo sản phẩm mới</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              Tên sản phẩm <span className="text-red-400">*</span>
            </label>
            <input
              value={formData.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Ví dụ: Áo thun basic"
              className={`input-field w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:border-indigo-400 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
            />
            {errors.name && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                Giá (VND) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1000"
                value={formData.price}
                onChange={e => set("price", e.target.value)}
                placeholder="150000"
                className={`input-field w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:border-indigo-400 ${errors.price ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
              />
              {errors.price && <p className="text-xs text-red-500">⚠ {errors.price}</p>}
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Số lượng tồn kho <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={e => set("stockQuantity", e.target.value)}
                placeholder="20"
                className={`input-field w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:border-indigo-400 ${errors.stockQuantity ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
              />
              {errors.stockQuantity && <p className="text-xs text-red-500">⚠ {errors.stockQuantity}</p>}
            </div>
          </div>

          {/* Preview */}
          {(formData.name || formData.price) && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs text-indigo-400 font-medium mb-2 uppercase tracking-wider">Xem trước</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-800">{formData.name || "Tên sản phẩm"}</span>
                <span className="text-sm font-bold text-indigo-600">
                  {formData.price ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(formData.price)) : "--"}
                </span>
              </div>
              <div className="text-xs text-indigo-400 mt-1">Tồn kho: {formData.stockQuantity || "0"} • Trạng thái: ACTIVE</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Link to="/products" className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Đang lưu..." : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
