import { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  fullWidth?: boolean;
}

export default function Textarea({ label, fullWidth = true, className, ...props }: TextareaProps) {
  return (
    <div className={clsx(fullWidth && "w-full")}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={clsx(
          "border border-gray-300 px-4 py-2 rounded-lg text-gray-700 transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[100px]",
          className,
          fullWidth && "w-full"
        )}
      />
    </div>
  );
}
