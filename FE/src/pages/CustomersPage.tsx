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
  label,
  field,
  value,
  error,
  type = "text",
  placeholder,
  icon: Icon,
  onChange,
  onBlur,
  maxLength,
  inputMode,
}: CustomerFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Icon className="h-3.5 w-3.5 text-indigo-400" />
        {label}
        <span className="text-red-400">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        onBlur={() => onBlur(field)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`input-field w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-indigo-400 focus:outline-none ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
      />
      {error && <p className="text-xs text-red-500">⚠ {error}</p>}
    </div>
  );
}

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });

  const syncFieldError = (field: CustomerFieldName, nextData: CustomerFormData) => {
    const nextError = validateCustomerForm(nextData)[field];
    setErrors((prev) => {
      const next = { ...prev };
      if (nextError) next[field] = nextError;
      else delete next[field];
      return next;
    });
  };

  const setField = (field: CustomerFieldName, value: string) => {
    const normalizedValue = field === "phone" ? sanitizePhoneNumber(value) : value;
    const nextData = { ...formData, [field]: normalizedValue };
    setFormData(nextData);
    if (errors[field]) syncFieldError(field, nextData);
  };

  const handleBlur = (field: CustomerFieldName) => {
    syncFieldError(field, formData);
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = normalizeCustomerForm(formData);
    const validationErrors = validateCustomerForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormData(payload);
      return;
    }

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
        <h1 className="text-2xl font-bold text-slate-800">Khách hàng</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {isError ? "—" : `${customers.length} khách hàng đã đăng ký`}
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[380px_1fr]">
        <div className="sticky top-20 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <UserPlus className="h-4 w-4 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700">Thêm khách hàng mới</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CustomerField
              label="Họ và tên"
              field="fullName"
              value={formData.fullName}
              error={errors.fullName}
              placeholder="Nguyễn Văn A"
              icon={Users}
              onChange={setField}
              onBlur={handleBlur}
            />
            <CustomerField
              label="Số điện thoại"
              field="phone"
              value={formData.phone}
              error={errors.phone}
              placeholder="0912345678"
              icon={Phone}
              onChange={setField}
              onBlur={handleBlur}
              maxLength={10}
              inputMode="numeric"
            />
            <CustomerField
              label="Email"
              field="email"
              value={formData.email}
              error={errors.email}
              type="email"
              placeholder="a@example.com"
              icon={Mail}
              onChange={setField}
              onBlur={handleBlur}
            />
            <CustomerField
              label="Địa chỉ"
              field="address"
              value={formData.address}
              error={errors.address}
              placeholder="Quận 1, TP.HCM"
              icon={MapPin}
              onChange={setField}
              onBlur={handleBlur}
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Tạo khách hàng"}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-[720px] w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Khách hàng</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Liên hệ</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-slate-100 animate-pulse" />
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
                  {!isError &&
                    customers.map((customer, idx) => (
                      <tr
                        key={customer.id}
                        className={`table-row-hover ${idx < customers.length - 1 ? "border-b border-slate-50" : ""}`}
                      >
                        <td className="px-5 py-4 text-sm text-slate-400">#{customer.id}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
                              {customer.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{customer.fullName}</p>
                              <p className="text-xs text-slate-400">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {customer.phone}
                          </div>
                        </td>
                        <td className="max-w-[220px] truncate px-5 py-4 text-sm text-slate-500" title={customer.address}>
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
  );
}
