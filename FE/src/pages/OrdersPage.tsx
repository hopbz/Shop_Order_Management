import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ShoppingCart, Filter } from "lucide-react";
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

const STATUS_CLASS: Record<string, string> = {
  PENDING:   "badge-pending",
  CONFIRMED: "badge-confirmed",
  SHIPPING:  "badge-shipping",
  COMPLETED: "badge-completed",
  CANCELED:  "badge-canceled",
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [filter, setFilter]   = useState("");

  const fetchOrders = useCallback(async (status?: string) => {
    setLoading(true);
    setIsError(false);
    try {
      const data = await api.getOrders(status || undefined);
      setOrders(data);
    } catch {
      setIsError(true);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleFilterChange = (status: string) => {
    setFilter(status);
    fetchOrders(status || undefined);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  /* counts shown on filter chips — always from full list regardless of active filter */
  const countOf = (s: string) => orders.filter(o => o.status === s).length;

  return (
    <div className="space-y-5">
      {/* Offline banner */}
      <OfflineBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đơn hàng</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isError ? "—" : `${orders.length} đơn • Tổng: ${formatCurrency(totalRevenue)}`}
          </p>
        </div>
        <Link
          to="/orders/new"
          className="btn-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tạo đơn hàng
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <button
          onClick={() => handleFilterChange("")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !filter
              ? "bg-indigo-500 text-white shadow-sm"
              : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-500"
          }`}
        >
          Tất cả {!filter && !isError && `(${orders.length})`}
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === s
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-500"
            }`}
          >
            {STATUS_LABEL[s]} {!filter && !isError && `(${countOf(s)})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Mã ĐH","Mã KH","Tổng tiền","Ngày tạo","Trạng thái","Chi tiết"].map((h, i) => (
                <th key={h} className={`px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : (
              <>
                <EmptyState
                  colSpan={6}
                  icon={<ShoppingCart className="w-10 h-10" />}
                  emptyText="Chưa có đơn hàng nào"
                  isEmpty={orders.length === 0 && !isError}
                  isError={isError}
                  onRetry={() => fetchOrders(filter || undefined)}
                />
                {!isError && orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`table-row-hover cursor-pointer ${idx < orders.length - 1 ? "border-b border-slate-50" : ""}`}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4"><span className="text-sm font-bold text-indigo-600">#{order.id}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {order.customerId}
                        </div>
                        <span className="text-sm text-slate-600">KH #{order.customerId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CLASS[order.status] ?? ""}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-indigo-400 text-xs font-medium">Xem →</span>
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
