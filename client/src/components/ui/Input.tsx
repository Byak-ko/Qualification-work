import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  icon,
  label,
  fullWidth = true,
  className,
  rightIcon,
  ...props
}: InputProps) {
  return (
    <div className={clsx(fullWidth && "w-full")}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={clsx(
            "border border-gray-300 py-2 px-3 rounded-lg text-gray-900 bg-white transition duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm",
            icon && "pl-10",
            rightIcon && "pr-10",
            fullWidth && "w-full",
            className
          )}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}
