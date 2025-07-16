import React from "react"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success"
  size?: "sm" | "md" | "lg"
  icon?: "arrow" | "chevron"
  loading?: boolean
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = "primary", size = "md", icon = "arrow", loading = false, children, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white border-blue-500",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white border-gray-500",
      success: "bg-green-600 hover:bg-green-700 text-white border-green-500",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    const IconComponent = icon === "arrow" ? ArrowRight : ChevronRight

    return (
      <button
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-lg border-2 font-semibold transition-all duration-300 ease-out",
          "hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
          "before:translate-x-[-100%] before:transition-transform before:duration-700",
          "hover:before:translate-x-[100%]",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={loading}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              {children}
            </>
          )}
        </span>

        {/* Efeito de brilho */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>
      </button>
    )
  },
)

EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton }
