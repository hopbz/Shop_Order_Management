import { useEffect, useState, type ElementType, type FormEvent, type InputHTMLAttributes } from "react";
import { api, Customer } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { Users, Mail, Phone, MapPin, UserPlus } from "lucide-react";
import OfflineBanner from "@/components/OfflineBanner";
import EmptyState from "@/components/EmptyState";
import {
  type CustomerFormData,
  normalizeCustomerForm,
  sanitizePhoneNumber,
  validateCustomerForm,
} from "@/lib/validation";

type CustomerFieldName = keyof CustomerFormData;

interface CustomerFieldProps {
  label: string;
  field: CustomerFieldName;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  icon: ElementType;
  onChange: (field: CustomerFieldName, value: string) => void;
  onBlur: (field: CustomerFieldName) => void;
  maxLength?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}

function CustomerField({
  label, field, value, error, type = "text", placeholder,
  icon: Icon, onChange, onBlur, maxLength, inputMode,
}: CustomerFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3 w-3 text-slate-400" />
        {label}
        <span className="normal-case text-red-400 font-normal">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(field, e.target.value)}
        onBlur={() => onBlur(field)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`input-field w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none ${
          error
            ? "border-red-300 bg-red-50 text-red-900 placeholder:text-red-300"
            : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-400"
        }`}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span className="text-red-400">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* Avatar color palette */
const AVATAR_COLORS = [
  "from-indigo-400 to-violet-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
];
const avatarGradient = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [isError,     setIsError]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [formData,    setFormData]    = useState<CustomerFormData>({ fullName: "", phone: "", email: "", address: "" });

  const syncFieldError = (field: CustomerFieldName, next: CustomerFormData) => {
    const err = validateCustomerForm(next)[field];
    setErrors(prev => { const n = { ...prev }; err ? n[field] = err : delete n[field]; return n; });
  };

  const setField = (field: CustomerFieldName, value: string) => {
    const v = field === "phone" ? sanitizePhoneNumber(value) : value;
    const next = { ...formData, [field]: v };
    setFormData(next);
    if (errors[field]) syncFieldError(field, next);
  };

  const handleBlur = (field: CustomerFieldName) => syncFieldError(field, formData);

  const fetchCustomers = async () => {
    setLoading(true);
    setIsError(false);
    try {
      setCustomers(await api.getCustomers());
    } catch {
      setIsError(true);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = normalizeCustomerForm(formData);
    const validationErrors = validateCustomerForm(payload);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); setFormData(payload); return; }

    setSubmitting(true);
    setErrors({});
    try {
      await api.createCustomer(payload);
      setFormData({ fullName: "", phone: "", email: "", address: "" });
      toast("Thêm khách hàng thành công.", "success");
      await fetchCustomers();
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else toast(err.message || "Lỗi tạo khách hàng", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <OfflineBanner />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Khách hàng</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {isError ? "—" : <><span className="font-semibold text-slate-600">{customers.length}</span> khách hàng đã đăng ký</>}
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">

        {/* ─── Add form ─── */}
        <div className="page-card sticky top-20 p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <UserPlus className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Thêm khách hàng mới</h2>
              <p className="text-xs text-slate-400">Điền đầy đủ thông tin bên dưới</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CustomerField
              label="Họ và tên" field="fullName" value={formData.fullName}
              error={errors.fullName} placeholder="Nguyễn Văn A"
              icon={Users} onChange={setField} onBlur={handleBlur}
            />
            <CustomerField
              label="Số điện thoại" field="phone" value={formData.phone}
              error={errors.phone} placeholder="0912 345 678"
              icon={Phone} onChange={setField} onBlur={handleBlur}
              maxLength={10} inputMode="numeric"
            />
            <CustomerField
              label="Email" field="email" value={formData.email}
              error={errors.email} type="email" placeholder="example@email.com"
              icon={Mail} onChange={setField} onBlur={handleBlur}
            />
            <CustomerField
              label="Địa chỉ" field="address" value={formData.address}
              error={errors.address} placeholder="Số nhà, Quận, TP.HCM"
              icon={MapPin} onChange={setField} onBlur={handleBlur}
            />

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-md"
              >
                {submitting ? "Đang lưu..." : "Tạo khách hàng"}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Customer table ─── */}
        <div className="page-card overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Danh sách khách hàng</p>
            {!isError && !loading && (
              <span className="text-xs font-semibold text-indigo-500">{customers.length} người</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-14">ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Khách hàng</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Liên hệ</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Địa chỉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {[14, 30, 20, 36].map((w, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="skeleton h-4" style={{ width: `${w}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    <EmptyState
                      colSpan={4}
                      icon={<Users className="h-10 w-10" />}
                      emptyText="Chưa có khách hàng nào"
                      isEmpty={customers.length === 0 && !isError}
                      isError={isError}
                      onRetry={fetchCustomers}
                    />
                    {!isError && customers.map(customer => (
                      <tr key={customer.id} className="table-row-hover">
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-400">#{customer.id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(customer.id)} text-xs font-bold text-white shadow-sm`}>
                              {customer.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-700">{customer.fullName}</p>
                              <p className="truncate text-xs text-slate-400">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Phone className="h-3 w-3 flex-shrink-0 text-slate-300" />
                            {customer.phone}
                          </div>
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-4 text-sm text-slate-500 hidden md:table-cell" title={customer.address}>
                          {customer.address}
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
    </div>
  );
}
