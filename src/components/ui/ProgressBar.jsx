import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  color = "blue",
  size = "md",
  className,
  showLabel,
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Progresso</span>
          <span className="text-xs font-semibold text-gray-700">{pct}%</span>
        </div>
      )}
      <div
        className={cn("w-full bg-gray-100 rounded-full overflow-hidden", {
          "h-1.5": size === "sm",
          "h-2.5": size === "md",
        })}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", {
            "bg-brand-500": color === "blue",
            "bg-success-400": color === "green",
            "bg-amber-400": color === "amber",
            "bg-gradient-to-r from-brand-500 to-success-400": color === "gradient",
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
