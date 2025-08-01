import React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  color?: "blue" | "green" | "orange" | "purple"
}

const colorVariants = {
  blue: {
    border: "border-blue-600/50 hover:border-blue-500",
    bg: "bg-blue-500 group-hover:bg-blue-600",
    text: "text-blue-100",
  },
  green: {
    border: "border-green-600/50 hover:border-green-500",
    bg: "bg-green-500 group-hover:bg-green-600",
    text: "text-green-100",
  },
  orange: {
    border: "border-orange-600/50 hover:border-orange-500",
    bg: "bg-orange-500 group-hover:bg-orange-600",
    text: "text-orange-100",
  },
  purple: {
    border: "border-purple-600/50 hover:border-purple-500",
    bg: "bg-purple-500 group-hover:bg-purple-600",
    text: "text-purple-100",
  },
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = "Button", color = "blue", className, ...props }, ref) => {
    const colorClasses = colorVariants[color]

    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-32 cursor-pointer overflow-hidden rounded-full border bg-gray-800/50 p-2 text-center font-semibold text-gray-200 backdrop-blur-sm transition-all duration-300",
          colorClasses.border,
          className,
        )}
        {...props}
      >
        <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {text}
        </span>
        <div
          className={cn(
            "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100",
            colorClasses.text,
          )}
        >
          <span>{text}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
        <div
          className={cn(
            "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
            colorClasses.bg,
          )}
        ></div>
      </button>
    )
  },
)

InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }
