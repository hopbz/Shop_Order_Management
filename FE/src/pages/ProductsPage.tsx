import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Package, Trash2, X } from "lucide-react";
import { api, Product } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import OfflineBanner from "@/components/OfflineBanner";
import EmptyState from "@/components/EmptyState";

export default function ProductsPage() {
  const { toast } = useToast();
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isError,   setIsError]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [updating,  setUpdating]  = useState<number | null>(null);
  const [deleting,  setDeleting]  = useState<number | null>(null);

  const fetchProducts = useCallback(async (name?: string) => {
    setLoading(true);
    setIsError(false);
    try {
      setProducts(await api.getProducts(name));
    } catch {
      setIsError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search.trim() || undefined);
  };

  const clearSearch = () => { setSearch(""); fetchProducts(); };

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
      toast(`Đã chuyển sang ${newStatus === "ACTIVE" ? "Hoạt động" : "Ngừng bán"}`, "success");
    } catch {
      toast("Lỗi cập nhật trạng thái", "error");
    } finally {
      setUpdating(null);
    }
  };

  const activeCount = products.filter(p => p.status === "ACTIVE").length;

  const stockColor = (qty: number) => {
    if (qty === 0) return "text-red-500 font-semibold";
    if (qty < 5)  return "text-amber-500 font-semibold";
    return "text-slate-700";
  };

  return (
    <div className="space-y-5">
      <OfflineBanner />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {isError ? "—" : (
              <span>
                <span className="font-semibold text-emerald-600">{activeCount}</span>
                {" đang bán · "}
                <span className="font-medium text-slate-500">{products.length} tổng cộng</span>
              </span>
            )}
          </p>
        </div>
        <Link
          to="/products/new"
          className="btn-primary inline-flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="input-field w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          Tìm
        </button>
      </form>

      {/* Table */}
      <div className="page-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-16">ID</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sản phẩm</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Giá bán</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tồn kho</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="skeleton h-4 w-full" style={{ width: `${60 + (j * 10) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  <EmptyState
                    colSpan={6}
                    icon={<Package className="h-10 w-10" />}
                    emptyText="Chưa có sản phẩm nào"
                    isEmpty={products.length === 0 && !isError}
                    isError={isError}
                    onRetry={() => fetchProducts(search.trim() || undefined)}
                  />
                  {!isError && products.map(product => (
                    <tr key={product.id} className="table-row-hover">
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-400">#{product.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <Package className="h-4 w-4 text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${stockColor(product.stockQuantity)}`}>
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity === 0 && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                              Hết
                            </span>
                          )}
                          {product.stockQuantity > 0 && product.stockQuantity < 5 && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                              Sắp hết
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge-base ${product.status === "ACTIVE" ? "badge-active" : "badge-inactive"}`}>
                          {product.status === "ACTIVE" ? "Hoạt động" : "Ngừng bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={updating === product.id}
                            onClick={() => handleStatusChange(product.id, product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                              product.status === "ACTIVE"
                                ? "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            } disabled:opacity-40`}
                          >
                            {updating === product.id ? "..." : product.status === "ACTIVE" ? "Ngừng bán" : "Kích hoạt"}
                          </button>
                          <button
                            disabled={deleting === product.id}
                            onClick={() => handleSoftDelete(product.id, product.name)}
                            title="Xóa mềm"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}
