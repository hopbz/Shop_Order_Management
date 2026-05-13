import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, ShoppingCart, Users, TrendingUp, ArrowRight,
  Clock, Plus, ArrowUpRight,
} from "lucide-react";
import { api, Product, Order, Customer } from "@/services/api";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING:   "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING:  "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELED:  "Đã hủy",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING:   "badge-base badge-pending",
  CONFIRMED: "badge-base badge-confirmed",
  SHIPPING:  "badge-base badge-shipping",
  COMPLETED: "badge-base badge-completed",
  CANCELED:  "badge-base badge-canceled",
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accentClass: string;
  loading: boolean;
}

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, accentClass, loading }: StatCardProps) {
  return (
    <div className="page-card group flex flex-col gap-4 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="mt-2">
            {loading ? (
              <div className="skeleton h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-slate-800">{value}</p>
            )}
          </div>
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{sub}</p>
        <div className={`h-1 w-12 rounded-full ${accentClass} opacity-60`} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getOrders(), api.getCustomers()])
      .then(([p, o, c]) => { setProducts(p); setOrders(o); setCustomers(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue   = orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.totalAmount, 0);
  const activeProducts = products.filter(p => p.status === "ACTIVE").length;
  const pendingOrders  = orders.filter(o => o.status === "PENDING").length;
  const recentOrders   = [...orders].reverse().slice(0, 6);

  const stats: StatCardProps[] = [
    {
      label:       "Doanh thu",
      value:       formatCurrency(totalRevenue),
      sub:         "Từ đơn hoàn thành",
      icon:        TrendingUp,
      iconBg:      "bg-violet-50",
      iconColor:   "text-violet-600",
      accentClass: "stat-accent-purple",
      loading,
    },
    {
      label:       "Sản phẩm",
      value:       activeProducts.toString(),
      sub:         `${products.length} tổng cộng`,
      icon:        Package,
      iconBg:      "bg-blue-50",
      iconColor:   "text-blue-600",
      accentClass: "stat-accent-blue",
      loading,
    },
    {
      label:       "Đơn hàng",
      value:       orders.length.toString(),
      sub:         `${pendingOrders} chờ xử lý`,
      icon:        ShoppingCart,
      iconBg:      "bg-emerald-50",
      iconColor:   "text-emerald-600",
      accentClass: "stat-accent-green",
      loading,
    },
    {
      label:       "Khách hàng",
      value:       customers.length.toString(),
      sub:         "Đã đăng ký",
      icon:        Users,
      iconBg:      "bg-orange-50",
      iconColor:   "text-orange-500",
      accentClass: "stat-accent-orange",
      loading,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ─── Page header ─── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Xin chào, Admin 👋</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
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

      {/* ─── Stats grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ─── Recent orders ─── */}
      <div className="page-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700">Đơn hàng gần đây</h2>
          </div>
          <Link
            to="/orders"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-px p-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <ShoppingCart className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm text-slate-400">Chưa có đơn hàng nào</p>
            <Link to="/orders/new" className="mt-3 text-xs font-medium text-indigo-500 hover:text-indigo-700">
              Tạo đơn hàng đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mã ĐH</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customerId);
                  return (
                    <tr key={order.id} className="table-row-hover">
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-bold text-indigo-600">#{order.id}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-bold text-white shadow-sm">
                            {customer ? customer.fullName.charAt(0).toUpperCase() : "?"}
                          </div>
                          <span className="text-sm text-slate-600 font-medium">{customer?.fullName ?? `KH #${order.customerId}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-semibold text-slate-700">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={STATUS_CLASS[order.status] ?? "badge-base"}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                          Xem
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Quick actions ─── */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            to:      "/products/new",
            icon:    Package,
            iconBg:  "bg-indigo-50 group-hover:bg-indigo-100",
            iconCol: "text-indigo-500",
            arrowCol:"group-hover:text-indigo-400",
            title:   "Thêm sản phẩm",
            desc:    "Tạo sản phẩm mới vào kho",
          },
          {
            to:      "/orders/new",
            icon:    ShoppingCart,
            iconBg:  "bg-emerald-50 group-hover:bg-emerald-100",
            iconCol: "text-emerald-600",
            arrowCol:"group-hover:text-emerald-400",
            title:   "Tạo đơn hàng",
            desc:    "Đặt hàng mới cho khách",
          },
          {
            to:      "/customers",
            icon:    Users,
            iconBg:  "bg-orange-50 group-hover:bg-orange-100",
            iconCol: "text-orange-500",
            arrowCol:"group-hover:text-orange-400",
            title:   "Khách hàng",
            desc:    "Xem và quản lý danh sách",
          },
        ].map(q => {
          const Icon = q.icon;
          return (
            <Link
              key={q.to}
              to={q.to}
              className="page-card group flex items-center gap-4 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-150"
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${q.iconBg} transition-colors`}>
                <Icon className={`h-5 w-5 ${q.iconCol}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">{q.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{q.desc}</p>
              </div>
              <ArrowRight className={`h-4 w-4 flex-shrink-0 text-slate-300 ${q.arrowCol} transition-colors`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
