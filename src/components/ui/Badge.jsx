import { cn } from "@/lib/utils";

export function Badge({ children, variant = "blue", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-sora",
        {
          "bg-brand-50 text-brand-500": variant === "blue",
          "bg-success-50 text-success-400": variant === "green",
          "bg-amber-50 text-amber-600": variant === "amber",
          "bg-danger-50 text-danger-400": variant === "red",
          "bg-gray-100 text-gray-500": variant === "gray",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
