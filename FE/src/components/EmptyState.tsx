import { WifiOff, RefreshCw } from "lucide-react";
import { useBackendStatus } from "@/hooks/useBackendStatus";

interface Props {
  colSpan: number;
  icon: React.ReactNode;
  emptyText: string;
  isEmpty: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export default function EmptyState({ colSpan, icon, emptyText, isEmpty, isError, onRetry }: Props) {
  const { status, recheck } = useBackendStatus();

  if (isError || status === "offline") {
    return (
      <tr>
        <td colSpan={colSpan} className="py-16 text-center">
          <WifiOff className="w-10 h-10 mx-auto text-red-300 mb-3" />
          <p className="text-sm font-medium text-red-500 mb-1">Không thể tải dữ liệu</p>
          <p className="text-xs text-slate-400 mb-4">Backend chưa sẵn sàng hoặc mất kết nối</p>
          <button
            onClick={() => { recheck(); onRetry?.(); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </button>
        </td>
      </tr>
    );
  }

  if (isEmpty) {
    return (
      <tr>
        <td colSpan={colSpan} className="py-16 text-center">
          <div className="text-slate-300 mb-3 flex justify-center">{icon}</div>
          <p className="text-slate-400 text-sm">{emptyText}</p>
        </td>
      </tr>
    );
  }

  return null;
}
