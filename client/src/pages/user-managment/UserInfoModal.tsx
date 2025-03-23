import { User } from "../../types/User";
import { BuildingOfficeIcon, EnvelopeIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "../../types/User";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  departmentName?: string;
}

export default function UserInfoModal({ isOpen, onClose, user, departmentName }: UserInfoModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Інформація про користувача</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Прізвище та Ім’я:</span> {user.lastName} {user.firstName}</p>
                <p className="flex items-center gap-1"><EnvelopeIcon className="w-4 h-4" /> {user.email}</p>
                <p className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> {user.role === Role.ADMIN ? "Адміністратор" : "Викладач"}</p>
                <p className="flex items-center gap-1"><BuildingOfficeIcon className="w-4 h-4" /> {departmentName}</p>
                <p><span className="font-medium">Посада:</span> {user.position || "—"}</p>
                <p><span className="font-medium">Науковий ступінь:</span> {user.degree || "—"}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Закрити
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
