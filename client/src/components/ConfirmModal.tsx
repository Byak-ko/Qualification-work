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
  const { icon, gradient, bgGradient, borderColor, buttonGradient } = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center"
        >
          <div className={`fixed top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r ${bgGradient} rounded-full filter blur-3xl opacity-30 z-0 animate-pulse`}></div>
          <div className={`fixed bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r ${bgGradient} rounded-full filter blur-3xl opacity-30 z-0`}></div>
          
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full max-w-sm border ${borderColor} z-10`}
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
                onClick={onSubmit}
                className={`px-5 py-2 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                Так
              </Button>
              <Button 
                onClick={onClose} 
                variant="secondary"
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
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