import { motion } from "framer-motion";
import clsx from "clsx";
import { ReactNode } from "react";

interface ButtonProps {
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
  full?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "edit" | "danger" | "green" | "icon-edit" | "icon-danger" | "icon-secondary";
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
  className,
}: ButtonProps) {
  const sizes = {
    sm: "text-sm px-2 py-1",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium focus:outline-none transition duration-300";

  const variants: Record<string, string> = {
    primary: "text-white bg-blue-600 hover:bg-blue-700",
    secondary: "text-gray-800 bg-gray-200 hover:bg-gray-300",
    edit: "text-white bg-yellow-500 hover:bg-yellow-600",
    danger: "text-white bg-red-500 hover:bg-red-600",
    green: "text-white bg-green-500 hover:bg-green-600",
    "icon-edit": "text-yellow-500 bg-yellow-50 hover:bg-yellow-100 p-1.5 rounded-md",
    "icon-danger": "text-red-500 bg-red-50 hover:bg-red-100 p-1.5 rounded-md",
    "icon-secondary": "text-gray-500 hover:text-indigo-600 p-2 rounded-full",
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
        variants[variant],
        className
      )}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}