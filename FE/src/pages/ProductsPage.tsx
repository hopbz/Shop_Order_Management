import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Package, Trash2 } from "lucide-react";
import { api, Product } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import OfflineBanner from "@/components/OfflineBanner";
import EmptyState from "@/components/EmptyState";

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = useCallback(async (name?: string) => {
    setLoading(true);
    setIsError(false);
    try {
      const data = await api.getProducts(name);
      setProducts(data);
    } catch {
      setIsError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search.trim() || undefined);
  };

  const handleSoftDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa mềm sản phẩm "${name}"?\n\nSản phẩm sẽ bị ẩn khỏi danh sách nhưng lịch sử đơn hàng vẫn được giữ nguyên.`)) return;
    setDeleting(id);
    try {
      await api.softDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast(`Đã xóa mềm sản phẩm "${name}"`, "success");
    } catch {
      toast("Lỗi xóa sản phẩm", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (id: number, newStatus: "ACTIVE" | "INACTIVE") => {
    setUpdating(id);
    try {
      await api.updateProductStatus(id, newStatus);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast(`Đã chuyển sản phẩm sang ${newStatus === "ACTIVE" ? "Hoạt động" : "Ngừng bán"}`, "success");
    } catch {
      toast("Lỗi cập nhật trạng thái", "error");
    } finally {
      setUpdating(null);
    }
  };

  const activeCount = products.filter(p => p.status === "ACTIVE").length;

  return (
    <div className="space-y-5">
      <OfflineBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="text-slate-500 text-sm mt-0.5">{isError ? "—" : `${activeCount} đang bán / ${products.length} tổng cộng`}</p>
        </div>
        <Link
          to="/products/new"
          className="btn-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="input-field w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
          Tìm
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(""); fetchProducts(); }} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Xóa
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên sản phẩm</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Giá</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tồn kho</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <>
                <EmptyState
                  colSpan={6}
                  icon={<Package className="w-10 h-10" />}
                  emptyText="Chưa có sản phẩm nào"
                  isEmpty={products.length === 0 && !isError}
                  isError={isError}
                  onRetry={() => fetchProducts(search.trim() || undefined)}
                />
                {!isError && products.map((product, idx) => (
                <tr key={product.id} className={`table-row-hover ${idx < products.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <td className="px-6 py-4 text-sm text-slate-500">#{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stockQuantity === 0 ? "text-red-500" : product.stockQuantity < 5 ? "text-amber-500" : "text-slate-700"}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${product.status === "ACTIVE" ? "badge-active" : "badge-inactive"}`}>
                      {product.status === "ACTIVE" ? "Hoạt động" : "Ngừng bán"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={updating === product.id}
                        onClick={() => handleStatusChange(product.id, product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          product.status === "ACTIVE"
                            ? "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        } disabled:opacity-50`}
                      >
                        {updating === product.id ? "..." : product.status === "ACTIVE" ? "Ngừng bán" : "Kích hoạt"}
                      </button>
                      <button
                        disabled={deleting === product.id}
                        onClick={() => handleSoftDelete(product.id, product.name)}
                        title="Xóa mềm (ẩn khỏi danh sách, giữ lịch sử đơn hàng)"
                        className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
