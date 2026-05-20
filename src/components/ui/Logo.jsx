import { cn } from "@/lib/utils";

export function Logo({ size = "md", className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-400 text-white font-sora font-bold flex-shrink-0",
          {
            "w-7 h-7 text-sm": size === "sm",
            "w-9 h-9 text-base": size === "md",
            "w-12 h-12 text-xl": size === "lg",
          }
        )}
      >
        A
      </div>
      <span
        className={cn("font-sora font-bold text-gray-900", {
          "text-base": size === "sm",
          "text-xl": size === "md",
          "text-2xl": size === "lg",
        })}
      >
        Aprova<span className="text-brand-500">AI</span>
      </span>
    </div>
  );
}
