import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-gray-900 text-white shadow-sm",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-100 text-red-700",
    warning: "border-transparent bg-yellow-100 text-yellow-800",
    success: "border-transparent bg-emerald-100 text-emerald-800",
    outline: "text-gray-950 border-gray-200",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
export { Badge }
