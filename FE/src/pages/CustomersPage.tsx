import { useEffect, useState } from "react";
import { api, Customer } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { Users, Mail, Phone, MapPin, UserPlus } from "lucide-react";
import OfflineBanner from "@/components/OfflineBanner";
import EmptyState from "@/components/EmptyState";

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "", address: "" });

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setIsError(false);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch {
      setIsError(true);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await api.createCustomer(formData);
      setFormData({ fullName: "", phone: "", email: "", address: "" });
      toast("Thêm khách hàng thành công!", "success");
      fetchCustomers();
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else toast(err.message || "Lỗi tạo khách hàng", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder, icon: Icon }: {
    label: string; field: string; type?: string; placeholder?: string; icon: React.ElementType;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-indigo-400" />
        {label} <span className="text-red-400">*</span>
      </label>
      <input
        type={type}
        value={(formData as any)[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className={`input-field w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:border-indigo-400 ${(errors as any)[field] ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
      />
      {(errors as any)[field] && <p className="text-xs text-red-500">⚠ {(errors as any)[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <OfflineBanner />

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Khách hàng</h1>
        <p className="text-slate-500 text-sm mt-0.5">{isError ? "—" : `${customers.length} khách hàng đã đăng ký`}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr] items-start">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-20">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="font-semibold text-slate-700 text-sm">Thêm khách hàng mới</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Họ và tên" field="fullName" placeholder="Nguyễn Văn A" icon={Users} />
            <Field label="Số điện thoại" field="phone" placeholder="0912345678" icon={Phone} />
            <Field label="Email" field="email" type="email" placeholder="a@example.com" icon={Mail} />
            <Field label="Địa chỉ" field="address" placeholder="Quận 1, TP.HCM" icon={MapPin} />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-white py-2.5 rounded-xl text-sm font-semibold mt-2 disabled:opacity-60 shadow-md"
            >
              {submitting ? "Đang lưu..." : "Tạo khách hàng"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Liên hệ</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  <EmptyState
                    colSpan={4}
                    icon={<Users className="w-10 h-10" />}
                    emptyText="Chưa có khách hàng nào"
                    isEmpty={customers.length === 0 && !isError}
                    isError={isError}
                    onRetry={fetchCustomers}
                  />
                  {!isError && customers.map((c, idx) => (
                  <tr key={c.id} className={`table-row-hover ${idx < customers.length - 1 ? "border-b border-slate-50" : ""}`}>
                    <td className="px-5 py-4 text-sm text-slate-400">#{c.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{c.fullName}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[180px] truncate" title={c.address}>
                      {c.address}
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
