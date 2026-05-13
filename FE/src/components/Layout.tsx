import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Package, ShoppingCart, Users, LayoutDashboard, TrendingUp,
  WifiOff, Loader2, Menu, X, Bell, ChevronRight, Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackendStatus } from "@/hooks/useBackendStatus";

const navItems = [
  { name: "Tổng quan",   href: "/",          icon: LayoutDashboard },
  { name: "Sản phẩm",    href: "/products",  icon: Package },
  { name: "Đơn hàng",    href: "/orders",    icon: ShoppingCart },
  { name: "Khách hàng",  href: "/customers", icon: Users },
];

const BREADCRUMBS: Record<string, { title: string; parent?: string; parentHref?: string }> = {
  "/":              { title: "Tổng quan" },
  "/products":      { title: "Sản phẩm" },
  "/products/new":  { title: "Thêm sản phẩm", parent: "Sản phẩm", parentHref: "/products" },
  "/customers":     { title: "Khách hàng" },
  "/orders":        { title: "Đơn hàng" },
  "/orders/new":    { title: "Tạo đơn hàng", parent: "Đơn hàng", parentHref: "/orders" },
};

function BackendIndicator() {
  const { status, recheck } = useBackendStatus();
  return (
    <button
      onClick={recheck}
      title="Nhấn để kiểm tra lại kết nối"
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all select-none",
        status === "online"   && "text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
        status === "offline"  && "text-red-600 bg-red-50 hover:bg-red-100",
        status === "checking" && "text-slate-500 bg-slate-100",
      )}
    >
      {status === "checking" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "online" && (
        <span className="relative flex h-2 w-2">
          <span className="ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {status === "offline" && <WifiOff className="h-3 w-3" />}
      <span className="hidden sm:inline">
        {status === "online" && "Online"}
        {status === "offline" && "Offline"}
        {status === "checking" && "Đang kiểm tra..."}
      </span>
    </button>
  );
}

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const crumb = BREADCRUMBS[location.pathname];
  const isOrderDetail = location.pathname.match(/^\/orders\/\d+$/);

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          "sidebar-bg fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-[18px]">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/25">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight text-white">ShopManager</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">Admin Panel</p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-md p-1 text-slate-500 hover:text-white transition-colors lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Menu
          </p>
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
                  "nav-item group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium",
                  isActive
                    ? "bg-indigo-500/[0.16] text-indigo-300"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300",
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow shadow-indigo-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-white/[0.06]" />

        {/* User */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-bold text-white shadow-md">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-200">Admin User</p>
              <p className="truncate text-[10px] text-slate-500">admin@shop.vn</p>
            </div>
            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
          </div>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-[220px]">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 transition-colors lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              {crumb?.parent ? (
                <>
                  <Link to={crumb.parentHref!} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {crumb.parent}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-700">{crumb.title}</span>
                </>
              ) : isOrderDetail ? (
                <>
                  <Link to="/orders" className="text-slate-400 hover:text-slate-600 transition-colors">
                    Đơn hàng
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-700">Chi tiết đơn</span>
                </>
              ) : (
                <span className="font-semibold text-slate-700">{crumb?.title ?? "ShopManager"}</span>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <BackendIndicator />
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
