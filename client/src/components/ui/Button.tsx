import { motion } from "framer-motion";
import clsx from "clsx";
import { ReactNode } from "react";

interface ButtonProps {
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
  full?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "green";
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
}

export default function Button({
  children,
  type = "button",
  full = false,
  disabled = false,
  icon,
  variant = "primary",
  size = "md",
  isLoading = false,
  onClick,
}: ButtonProps) {
  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 transition-all";

  const variants: Record<string, string> = {
    primary:
      "text-white bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-blue-300",
    secondary:
      "text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-gray-300",
    danger:
      "text-white bg-gradient-to-br from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 focus:ring-red-200",
    green:
      "text-white bg-gradient-to-br from-green-400 to-blue-600 hover:from-green-500 hover:to-blue-700 focus:ring-green-200",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.95 }}
      whileHover={!disabled && !isLoading ? { scale: 1.03 } : undefined}
      className={clsx(
        base,
        sizes[size],
        full && "w-full",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        variants[variant]
      )}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
