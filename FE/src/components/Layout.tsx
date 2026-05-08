import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Users, LayoutDashboard, TrendingUp, Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackendStatus } from "@/hooks/useBackendStatus";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sản phẩm",  href: "/products", icon: Package },
  { name: "Đơn hàng",  href: "/orders",   icon: ShoppingCart },
  { name: "Khách hàng",href: "/customers", icon: Users },
];

function BackendIndicator() {
  const { status, recheck } = useBackendStatus();
  return (
    <button
      onClick={recheck}
      title="Nhấn để kiểm tra lại kết nối"
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
        status === "online"   && "text-emerald-600",
        status === "offline"  && "text-red-500",
        status === "checking" && "text-slate-400",
      )}
    >
      {status === "checking" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "online"   && <Wifi    className="w-3 h-3" />}
      {status === "offline"  && <WifiOff className="w-3 h-3" />}

      {status === "checking" && "Đang kiểm tra..."}
      {status === "online"   && "Backend online"}
      {status === "offline"  && "Backend offline"}

      {status === "online" && (
        <span className="ml-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
      )}
    </button>
  );
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 sidebar-gradient flex flex-col z-20 shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">ShopManager</h1>
            <p className="text-slate-400 text-xs">Quản lý cửa hàng</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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
                  "nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div>
              <p className="text-white text-xs font-medium">Admin</p>
              <p className="text-slate-400 text-xs">admin@shop.vn</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-8 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </div>
          <BackendIndicator />
        </header>

        <main className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
