import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  TrendingUp,
  Wifi,
  WifiOff,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackendStatus } from "@/hooks/useBackendStatus";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/products", icon: Package },
  { name: "Đơn hàng", href: "/orders", icon: ShoppingCart },
  { name: "Khách hàng", href: "/customers", icon: Users },
];

function BackendIndicator() {
  const { status, recheck } = useBackendStatus();

  return (
    <button
      onClick={recheck}
      title="Nhấn để kiểm tra lại kết nối"
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
        status === "online" && "text-emerald-600",
        status === "offline" && "text-red-500",
        status === "checking" && "text-slate-400",
      )}
    >
      {status === "checking" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "online" && <Wifi className="h-3 w-3" />}
      {status === "offline" && <WifiOff className="h-3 w-3" />}

      {status === "checking" && "Đang kiểm tra..."}
      {status === "online" && "Backend online"}
      {status === "offline" && "Backend offline"}

      {status === "online" && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
    </button>
  );
}

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-slate-950/45 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "sidebar-gradient fixed inset-y-0 left-0 z-30 flex w-64 flex-col shadow-xl transition-transform duration-200",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-white">ShopManager</h1>
            <p className="text-xs text-slate-400">Quản lý cửa hàng</p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-400 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
              A
            </div>
            <div>
              <p className="text-xs font-medium text-white">Admin</p>
              <p className="text-xs text-slate-400">admin@shop.vn</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200/60 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="hidden text-sm text-slate-500 sm:block">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-sm font-semibold text-slate-700 sm:hidden">ShopManager</div>
            </div>
          </div>

          <BackendIndicator />
        </header>

        <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
