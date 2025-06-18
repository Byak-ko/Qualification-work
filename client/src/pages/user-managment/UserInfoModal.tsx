import { User } from "../../types/User";
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserIcon,
  XMarkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "../../types/User";
import { createPortal } from "react-dom";
import Button from "../../components/ui/Button";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserInfoModal({ isOpen, onClose, user }: UserInfoModalProps) {
  if (!user) return null;

  const userInfoItems = [
    {
      icon: <EnvelopeIcon className="w-5 h-5 text-blue-500" />,
      label: "Email",
      value: user.email,
    },
    {
      icon: <UserIcon className="w-5 h-5 text-green-500" />,
      label: "Роль",
      value: user.role === Role.ADMIN ? "Адміністратор" : "Викладач",
    },
    {
      icon: <BuildingOfficeIcon className="w-5 h-5 text-purple-500" />,
      label: "Кафедра",
      value: user.department.name || "—",
    },
    {
      icon: <BuildingOfficeIcon className="w-5 h-5 text-green-500" />,
      label: "Підрозділ",
      value: user.department.unit.name || "—",
    },
    {
      icon: <BriefcaseIcon className="w-5 h-5 text-orange-500" />,
      label: "Посада",
      value: user.position || "—",
    },
    {
      icon: <AcademicCapIcon className="w-5 h-5 text-teal-500" />,
      label: "Науковий ступінь",
      value: user.degree || "—",
    },
  ];

  const modalRoot = document.body;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              translateY: 50,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              translateY: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              translateY: 50,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden relative">
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user.lastName} {user.firstName}
                  </h2>
                  <p className="text-sm text-gray-500">Інформація про користувача</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<XMarkIcon className="w-6 h-6" />}
                  className="p-2"
                  onClick={onClose}
                />
              </div>

              <div className="p-6 space-y-4">
                {userInfoItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg transition-colors duration-300 hover:bg-gray-100"
                  >
                    {item.icon}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-lg px-5 py-2"
                  onClick={onClose}
                >
                  Закрити
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, modalRoot);
}