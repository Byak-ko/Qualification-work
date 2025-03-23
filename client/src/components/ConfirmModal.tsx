import { AnimatePresence, motion } from "framer-motion";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import type { JSX } from "react";

type ModalType = "info" | "danger" | "success";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ModalType;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

const typeConfig: Record<ModalType, { icon: JSX.Element; color: string }> = {
  info: {
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    color: "text-blue-600",
  },
  danger: {
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
    color: "text-red-600",
  },
  success: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    color: "text-green-600",
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
  const { icon, color } = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-3">
              {icon}
              <h2 className={`text-xl font-semibold ${color}`}>{title}</h2>
            </div>
            <p className="text-gray-700 mb-5">{message}</p>
            <div className="flex justify-end gap-2">
              <Button onClick={onSubmit}>Так</Button>
              <Button onClick={onClose} variant="secondary">
                Скасувати
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
