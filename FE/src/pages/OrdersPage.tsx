import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ShoppingCart, Filter } from "lucide-react";
import { api, Order, OrderStatus } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import OfflineBanner from "@/components/OfflineBanner";
import EmptyState from "@/components/EmptyState";

const ALL_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELED"];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  SHIPPING: "badge-shipping",
  COMPLETED: "badge-completed",
  CANCELED: "badge-canceled",
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      const data = await api.getOrders();
      setAllOrders(data);
    } catch {
      setIsError(true);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orders = filter ? allOrders.filter((order) => order.status === filter) : allOrders;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const countOf = (status: string) => allOrders.filter((order) => order.status === status).length;

  return (
    <div className="space-y-5">
      <OfflineBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đơn hàng</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isError ? "—" : `${orders.length} đơn • Tổng: ${formatCurrency(totalRevenue)}`}
          </p>
        </div>
        <Link
          to="/orders/new"
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn hàng
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <button
          onClick={() => setFilter("")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            !filter
              ? "bg-indigo-500 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-500"
          }`}
        >
          Tất cả {!isError && `(${allOrders.length})`}
        </button>
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === status
                ? "bg-indigo-500 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-500"
            }`}
          >
            {STATUS_LABEL[status]} {!isError && `(${countOf(status)})`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-[840px] w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Mã ĐH", "Mã KH", "Tổng tiền", "Ngày tạo", "Trạng thái", "Chi tiết"].map((header, index) => (
                <th
                  key={header}
                  className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 ${index === 5 ? "text-right" : "text-left"}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 rounded bg-slate-100 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <>
                <EmptyState
                  colSpan={6}
                  icon={<ShoppingCart className="h-10 w-10" />}
                  emptyText="Chưa có đơn hàng nào"
                  isEmpty={orders.length === 0 && !isError}
                  isError={isError}
                  onRetry={fetchOrders}
                />
                {!isError &&
                  orders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`table-row-hover cursor-pointer ${idx < orders.length - 1 ? "border-b border-slate-50" : ""}`}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-indigo-600">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
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
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[order.status] ?? ""}`}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-indigo-400">Xem →</span>
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
