import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-sora font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            // variants
            "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400 active:scale-[0.98]":
              variant === "primary",
            "bg-white text-gray-800 border border-gray-200 hover:border-brand-400 hover:text-brand-500 focus:ring-brand-300":
              variant === "secondary",
            "text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:ring-gray-200":
              variant === "ghost",
            "bg-danger-400 text-white hover:bg-danger-600 focus:ring-danger-400":
              variant === "danger",
            // sizes
            "text-xs px-4 py-2": size === "sm",
            "text-sm px-6 py-3": size === "md",
            "text-base px-8 py-4": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Carregando...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
