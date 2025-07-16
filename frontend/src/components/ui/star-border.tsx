import type React from "react"
import { cn } from "@/lib/utils"
import type { ElementType, ComponentPropsWithoutRef } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "#3b82f6" // Azul padrão para tema escuro

  return (
    <Component
      className={cn("relative inline-block py-[1px] overflow-hidden rounded-[20px] group", className)}
      {...props}
    >
      <div
        className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-20 dark:opacity-70 transition-opacity duration-500 group-hover:opacity-90",
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-20 dark:opacity-70 transition-opacity duration-500 group-hover:opacity-90",
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "relative z-10 border text-white text-center text-base py-4 px-6 rounded-[20px]",
          "bg-gradient-to-b from-gray-800/90 to-gray-900/90 border-gray-600/40",
          "transition-all duration-500 ease-out",
          "group-hover:from-gray-700/95 group-hover:to-gray-800/95 group-hover:border-gray-500/60",
          "group-hover:shadow-lg group-hover:shadow-blue-500/20",
          "group-hover:text-blue-100",
        )}
      >
        {children}
      </div>
    </Component>
  )
}
