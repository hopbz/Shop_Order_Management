import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { api, Product, Order, Customer } from "@/services/api";
import { formatCurrency } from "@/lib/utils";

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

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getOrders(), api.getCustomers()])
      .then(([p, o, c]) => {
        setProducts(p);
        setOrders(o);
        setCustomers(c);
      })
      .catch(() => { /* backend offline — leave arrays empty, banner shown in Layout */ })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeProducts = products.filter(p => p.status === "ACTIVE").length;
  const recentOrders = [...orders].reverse().slice(0, 5);

  const stats = [
    {
      label: "Doanh thu",
      value: formatCurrency(totalRevenue),
      sub: "Đơn hoàn thành",
      icon: TrendingUp,
      accent: "stat-accent-purple",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Sản phẩm",
      value: activeProducts.toString(),
      sub: `${products.length} tổng cộng`,
      icon: Package,
      accent: "stat-accent-blue",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Đơn hàng",
      value: orders.length.toString(),
      sub: `${orders.filter(o => o.status === "PENDING").length} chờ xử lý`,
      icon: ShoppingCart,
      accent: "stat-accent-green",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Khách hàng",
      value: customers.length.toString(),
      sub: "Đã đăng ký",
      icon: Users,
      accent: "stat-accent-orange",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
          <p className="text-slate-500 text-sm mt-0.5">Xin chào! Đây là báo cáo hôm nay.</p>
        </div>
        <Link
          to="/orders/new"
          className="btn-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md"
        >
          <ShoppingCart className="w-4 h-4" />
          Tạo đơn hàng
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div className={`w-2 h-6 ${s.accent} rounded-full opacity-60`} />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-0.5">
                {loading ? <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" /> : s.value}
              </div>
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-700">Đơn hàng gần đây</h2>
          </div>
          <Link to="/orders" className="text-indigo-500 text-sm font-medium flex items-center gap-1 hover:text-indigo-700">
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Mã ĐH</th>
                <th className="px-6 py-3 text-left">Khách hàng</th>
                <th className="px-6 py-3 text-left">Tổng tiền</th>
                <th className="px-6 py-3 text-left">Trạng thái</th>
                <th className="px-6 py-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <tr key={order.id} className={`table-row-hover ${idx < recentOrders.length - 1 ? "border-b border-slate-50" : ""}`}>
                    <td className="px-6 py-3.5 text-sm font-semibold text-indigo-600">#{order.id}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{customer?.fullName ?? `KH #${order.customerId}`}</td>
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-700">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASS[order.status] ?? ""}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link to={`/orders/${order.id}`} className="text-indigo-500 hover:text-indigo-700 text-xs font-medium">
                        Xem →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/products/new" className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Package className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Thêm sản phẩm</p>
            <p className="text-xs text-slate-400">Tạo sản phẩm mới</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400 transition-colors" />
        </Link>
        <Link to="/orders/new" className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Tạo đơn hàng</p>
            <p className="text-xs text-slate-400">Đặt hàng cho khách</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-emerald-400 transition-colors" />
        </Link>
        <Link to="/customers" className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Khách hàng</p>
            <p className="text-xs text-slate-400">Quản lý danh sách</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-orange-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
