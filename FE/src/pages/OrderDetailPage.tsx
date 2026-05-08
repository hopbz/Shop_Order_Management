import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, Order, Product, Customer, OrderStatus } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, User, Package, CheckCircle, Clock, Truck, XCircle, RotateCcw } from "lucide-react";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELED"];

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

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPING: Truck,
  COMPLETED: CheckCircle,
  CANCELED: XCircle,
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getOrder(Number(id))
      .then(async o => {
        setOrder(o);
        try { setCustomer(await api.getCustomer(o.customerId)); } catch {}
        const all = await api.getProducts();
        const map: Record<number, Product> = {};
        all.forEach(p => map[p.id] = p);
        setProductMap(map);
      })
      .catch(() => { toast("Không tìm thấy đơn hàng", "error"); navigate("/orders"); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const updated = await api.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      toast(`Đã cập nhật trạng thái: ${STATUS_LABEL[newStatus]}`, "success");
    } catch (err: any) {
      toast(err.message || "Lỗi cập nhật trạng thái", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-white rounded-2xl w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-48 bg-white rounded-2xl" />
          <div className="h-48 bg-white rounded-2xl" />
        </div>
        <div className="h-64 bg-white rounded-2xl" />
      </div>
    );
  }
  if (!order) return null;

  const isTerminal = order.status === "COMPLETED" || order.status === "CANCELED";
  const StatusIcon = STATUS_ICON[order.status] ?? RotateCcw;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Đơn hàng <span className="text-indigo-500">#{order.id}</span>
            </h1>
            <p className="text-slate-500 text-sm">
              {order.createdAt ? `Ngày tạo: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}` : ""}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold ${STATUS_CLASS[order.status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-600">Thông tin khách hàng</h2>
          </div>
          {customer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {customer.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-700">{customer.fullName}</p>
                  <p className="text-xs text-slate-400">{customer.email}</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                {[
                  { label: "Điện thoại", value: customer.phone },
                  { label: "Địa chỉ", value: customer.address },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-700 font-medium text-right max-w-[60%] truncate" title={value}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">KH #{order.customerId}</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Package className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-600">Tóm tắt đơn hàng</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Số sản phẩm</span>
              <span className="font-medium text-slate-700">{order.items.length} mặt hàng</span>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-end justify-between">
                <span className="text-sm text-slate-500">Tổng cộng</span>
                <span className="text-2xl font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Status changer */}
            {!isTerminal && (
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-medium text-slate-500 mb-2 block">Cập nhật trạng thái</label>
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={updating}
                  className="input-field w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors disabled:opacity-50"
                >
                  {STATUSES.filter(s => s !== "CANCELED" || order.status !== "COMPLETED").map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                {updating && <p className="text-xs text-indigo-400 mt-1 animate-pulse">Đang cập nhật...</p>}
              </div>
            )}
            {isTerminal && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center py-1">
                  {order.status === "COMPLETED" ? "✓ Đơn hàng đã hoàn thành" : "✕ Đơn hàng đã hủy"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-600">Chi tiết sản phẩm</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn giá</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Số lượng</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => {
              const p = productMap[item.productId];
              return (
                <tr key={item.id} className={`table-row-hover ${idx < order.items.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p?.name ?? `Sản phẩm #${item.productId}`}</p>
                        <p className="text-xs text-slate-400">ID: {item.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 rounded-full text-sm font-semibold text-slate-700">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{formatCurrency(item.lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-100 bg-slate-50">
              <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Tổng cộng</td>
              <td className="px-6 py-4 text-lg font-bold text-indigo-600 text-right">{formatCurrency(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
