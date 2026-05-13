import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, Order, Product, Customer, OrderStatus } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, User, Package, CheckCircle, Clock,
  Truck, XCircle, RotateCcw, Phone, MapPin, Mail,
} from "lucide-react";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELED"];

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

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING:   Clock,
  CONFIRMED: CheckCircle,
  SHIPPING:  Truck,
  COMPLETED: CheckCircle,
  CANCELED:  XCircle,
};

/* Dot color per status for the timeline */
const TIMELINE_DOT: Record<string, string> = {
  PENDING:   "bg-amber-400 border-amber-200",
  CONFIRMED: "bg-blue-400 border-blue-200",
  SHIPPING:  "bg-violet-500 border-violet-200",
  COMPLETED: "bg-emerald-500 border-emerald-200",
  CANCELED:  "bg-rose-400 border-rose-200",
};

const STATUS_SEQUENCE: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"];

export default function OrderDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [order,      setOrder]      = useState<Order | null>(null);
  const [customer,   setCustomer]   = useState<Customer | null>(null);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getOrder(Number(id))
      .then(async o => {
        setOrder(o);
        try { setCustomer(await api.getCustomer(o.customerId)); } catch {}
        const all = await api.getProducts();
        const map: Record<number, Product> = {};
        all.forEach(p => { map[p.id] = p; });
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
      toast(`Đã cập nhật: ${STATUS_LABEL[newStatus]}`, "success");
    } catch (err: any) {
      toast(err.message || "Lỗi cập nhật trạng thái", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="skeleton h-8 w-56 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="skeleton h-44 rounded-2xl" />
          <div className="skeleton h-44 rounded-2xl" />
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }
  if (!order) return null;

  const isTerminal   = order.status === "COMPLETED" || order.status === "CANCELED";
  const StatusIcon   = STATUS_ICON[order.status] ?? RotateCcw;

  /* Build timeline: show steps up to current, or all if canceled */
  const timelineSteps = order.status === "CANCELED"
    ? STATUSES
    : STATUS_SEQUENCE;

  const currentIdx = timelineSteps.indexOf(order.status as OrderStatus);

  return (
    <div className="mx-auto max-w-4xl space-y-5">

      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Đơn hàng <span className="text-indigo-500">#{order.id}</span>
            </h1>
            <p className="text-sm text-slate-400">
              {order.createdAt ? `Ngày tạo: ${new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}` : ""}
            </p>
          </div>
        </div>
        <span className={STATUS_BADGE[order.status] ?? "badge-base"} style={{ fontSize: 13 }}>
          <StatusIcon className="h-3.5 w-3.5 mr-0.5" />
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* ─── Status timeline (non-canceled only) ─── */}
      {order.status !== "CANCELED" && (
        <div className="page-card px-6 py-4">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tiến trình đơn hàng</p>
          <div className="flex items-center gap-0">
            {STATUS_SEQUENCE.map((s, i) => {
              const done    = i <= currentIdx;
              const current = i === currentIdx;
              const Icon    = STATUS_ICON[s] ?? RotateCcw;
              return (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                      current
                        ? `${TIMELINE_DOT[s]} shadow-md shadow-${s === "COMPLETED" ? "emerald" : "indigo"}-200`
                        : done
                          ? "border-indigo-200 bg-indigo-100"
                          : "border-slate-200 bg-white"
                    }`}>
                      <Icon className={`h-3.5 w-3.5 ${current ? "text-white" : done ? "text-indigo-400" : "text-slate-300"}`} />
                    </div>
                    <span className={`text-[10px] font-medium text-center leading-tight ${
                      current ? "text-indigo-600" : done ? "text-slate-500" : "text-slate-300"
                    }`}>
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                  {i < STATUS_SEQUENCE.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 mb-5 rounded-full ${i < currentIdx ? "bg-indigo-200" : "bg-slate-100"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Info cards ─── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Customer info */}
        <div className="page-card p-5">
          <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <User className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-600">Khách hàng</h2>
          </div>
          {customer ? (
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white shadow-sm">
                  {customer.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{customer.fullName}</p>
                  <p className="text-xs text-slate-400">ID #{customer.id}</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                {[
                  { icon: Mail,   value: customer.email },
                  { icon: Phone,  value: customer.phone },
                  { icon: MapPin, value: customer.address },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-start gap-2.5 text-sm">
                    <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                    <span className="text-slate-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">KH #{order.customerId}</p>
          )}
        </div>

        {/* Order summary + status changer */}
        <div className="page-card p-5">
          <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <Package className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-600">Tóm tắt đơn hàng</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Số mặt hàng</span>
              <span className="font-semibold text-slate-700">{order.items.length} sản phẩm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Trạng thái</span>
              <span className={STATUS_BADGE[order.status] ?? "badge-base"}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <div className="flex items-end justify-between rounded-xl bg-indigo-50 px-4 py-3 mt-1">
              <span className="text-sm text-indigo-600">Tổng cộng</span>
              <span className="text-2xl font-bold text-indigo-700">{formatCurrency(order.totalAmount)}</span>
            </div>

            {/* Status updater */}
            {!isTerminal && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 block">
                  Cập nhật trạng thái
                </label>
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={updating}
                  className="input-field w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-400 disabled:opacity-50 transition-colors"
                >
                  {STATUSES
                    .filter(s => !(s === "CANCELED" && order.status === "COMPLETED"))
                    .map(s => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))
                  }
                </select>
                {updating && <p className="animate-pulse text-xs text-indigo-400">Đang cập nhật...</p>}
              </div>
            )}
            {isTerminal && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5 text-center">
                <p className="text-xs text-slate-400">
                  {order.status === "COMPLETED"
                    ? "✓ Đơn hàng đã hoàn thành"
                    : "✕ Đơn hàng đã bị hủy"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Line items ─── */}
      <div className="page-card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Package className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-600">Chi tiết sản phẩm</h2>
          <span className="ml-auto text-xs text-slate-400">{order.items.length} mặt hàng</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sản phẩm</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Đơn giá</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">SL</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map(item => {
                const p = productMap[item.productId];
                return (
                  <tr key={item.id} className="table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                          <Package className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {p?.name ?? `Sản phẩm #${item.productId}`}
                          </p>
                          <p className="text-xs text-slate-400">ID: {item.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-100 bg-slate-50">
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-semibold text-slate-500">
                  Tổng cộng
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold text-indigo-600">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
