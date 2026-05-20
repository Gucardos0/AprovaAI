import { cn } from "@/lib/utils";

export function Card({ children, className, hover, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        hover && "cursor-pointer transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
