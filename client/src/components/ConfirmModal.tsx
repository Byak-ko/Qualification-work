import { AnimatePresence, motion } from "framer-motion";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import type { JSX } from "react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

type ModalType = "info" | "danger" | "success";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ModalType;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

const typeConfig: Record<ModalType, {
  icon: JSX.Element;
  color: string;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  buttonGradient: string;
}> = {
  info: {
    icon: <InformationCircleIcon className="w-7 h-7 text-blue-500" />,
    color: "text-blue-600",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    buttonGradient: "from-blue-500 to-indigo-500"
  },
  danger: {
    icon: <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />,
    color: "text-red-600",
    gradient: "from-red-500 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
    borderColor: "border-red-200",
    buttonGradient: "from-red-500 to-pink-500"
  },
  success: {
    icon: <CheckCircleIcon className="w-7 h-7 text-green-500" />,
    color: "text-green-600",
    gradient: "from-green-500 to-teal-500",
    bgGradient: "from-green-50 to-teal-50",
    borderColor: "border-green-200",
    buttonGradient: "from-green-500 to-teal-500"
  },
};

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onSubmit,
  onClose,
  type = "info",
}: ConfirmModalProps) => {
  const { icon, gradient, bgGradient, borderColor } = typeConfig[type];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      prevFocusedElementRef.current = document.activeElement as HTMLElement;
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      prevFocusedElementRef.current?.focus();
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className={`absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r ${bgGradient} rounded-full filter blur-3xl opacity-30 z-0 animate-pulse`}></div>
          <div className={`absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r ${bgGradient} rounded-full filter blur-3xl opacity-30 z-0`}></div>

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              ref={modalRef}
              className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full max-w-sm border ${borderColor} max-h-[90vh] overflow-y-auto`}
            >
              <div className={`p-3 mb-4 inline-block rounded-xl bg-gradient-to-r ${bgGradient}`}>
                {icon}
              </div>

              <h2 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient} mb-2`}>
                {title}
              </h2>

              <p className="text-gray-700 mb-6 leading-relaxed">{message}</p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="rounded-xl shadow-md hover:shadow-lg transform hover:scale-105"
                  aria-label="Підтвердити дію"
                  aria-busy={isSubmitting}
                >
                  Так
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl"
                  aria-label="Скасувати дію"
                >
                  Скасувати
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
export default ConfirmModal;