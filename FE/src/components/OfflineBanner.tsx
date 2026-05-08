import { WifiOff, RefreshCw } from "lucide-react";
import { useBackendStatus } from "@/hooks/useBackendStatus";

export default function OfflineBanner() {
  const { status, recheck } = useBackendStatus();
  if (status !== "offline") return null;

  return (
    <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold">Không kết nối được backend</p>
        <p className="text-xs text-red-500 mt-0.5">
          Hãy chắc chắn Spring Boot đang chạy tại <code className="font-mono bg-red-100 px-1 rounded">{import.meta.env.VITE_API_URL ?? "http://localhost:8080/api"}</code>
        </p>
      </div>
      <button
        onClick={recheck}
        className="flex items-center gap-1.5 text-xs font-medium bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Thử lại
      </button>
    </div>
  );
}
