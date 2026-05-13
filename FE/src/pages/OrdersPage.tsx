import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ShoppingCart } from "lucide-react";
import { api, Order, OrderStatus } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import OfflineBanner from "@/components/OfflineBanner";
import EmptyState from "@/components/EmptyState";

const ALL_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELED"];

const STATUS_LABEL: Record<string, string> = {
  PENDING:   "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING:  "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELED:  "Đã hủy",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING:   "badge-base badge-pending",
  CONFIRMED: "badge-base badge-confirmed",
  SHIPPING:  "badge-base badge-shipping",
  COMPLETED: "badge-base badge-completed",
  CANCELED:  "badge-base badge-canceled",
};

/* Filter tab dot colors */
const STATUS_DOT: Record<string, string> = {
  PENDING:   "bg-amber-400",
  CONFIRMED: "bg-blue-400",
  SHIPPING:  "bg-violet-500",
  COMPLETED: "bg-emerald-500",
  CANCELED:  "bg-rose-400",
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isError,   setIsError]   = useState(false);
  const [filter,    setFilter]    = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      setAllOrders(await api.getOrders());
    } catch {
      setIsError(true);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const orders       = filter ? allOrders.filter(o => o.status === filter) : allOrders;
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const countOf      = (s: string) => allOrders.filter(o => o.status === s).length;

  return (
    <div className="space-y-5">
      <OfflineBanner />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Đơn hàng</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {isError ? "—" : (
              <span>
                <span className="font-semibold text-slate-600">{orders.length}</span>
                {" đơn · Tổng: "}
                <span className="font-semibold text-indigo-600">{formatCurrency(totalRevenue)}</span>
              </span>
            )}
          </p>
        </div>
        <Link
          to="/orders/new"
          className="btn-primary inline-flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn hàng
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            !filter
              ? "bg-indigo-500 text-white shadow-sm shadow-indigo-200"
              : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
          }`}
        >
          Tất cả
          {!isError && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${!filter ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {allOrders.length}
            </span>
          )}
        </button>
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === status
                ? "bg-indigo-500 text-white shadow-sm shadow-indigo-200"
                : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${filter === status ? "bg-white" : STATUS_DOT[status]}`} />
            {STATUS_LABEL[status]}
            {!isError && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${filter === status ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {countOf(status)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="page-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Mã ĐH", "Khách hàng", "Tổng tiền", "Ngày tạo", "Trạng thái", ""].map((h, i) => (
                  <th
                    key={h || i}
                    className={`px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${i === 5 ? "text-right w-16" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="skeleton h-4" style={{ width: `${50 + (j * 15) % 45}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  <EmptyState
                    colSpan={6}
                    icon={<ShoppingCart className="h-10 w-10" />}
                    emptyText={filter ? `Không có đơn "${STATUS_LABEL[filter]}"` : "Chưa có đơn hàng nào"}
                    isEmpty={orders.length === 0 && !isError}
                    isError={isError}
                    onRetry={fetchOrders}
                  />
                  {!isError && orders.map(order => (
                    <tr
                      key={order.id}
                      className="table-row-hover cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-indigo-600">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-bold text-white shadow-sm">
                            {order.customerId}
                          </div>
                          <span className="text-sm text-slate-600">KH #{order.customerId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={STATUS_BADGE[order.status] ?? "badge-base"}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-semibold text-indigo-400">Xem →</span>
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
