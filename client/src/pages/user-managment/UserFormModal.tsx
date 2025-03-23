import { Role, User } from "../../types/User";
import { Department } from "../../types/Department";
import { motion, AnimatePresence } from "framer-motion";
import EditModal from "../../components/EditModal";

interface UserFormModalProps {
  isOpen: boolean;
  user: User | null;
  departments: Department[];
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
}

export default function UserFormModal({
  isOpen,
  user,
  departments,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg"
          >
            <EditModal
              isOpen={isOpen}
              title={user ? "Редагувати користувача" : "Новий користувач"}
              onClose={onClose}
              onSubmit={onSubmit}
              fields={[
                { name: "lastName", label: "Прізвище", defaultValue: user?.lastName || "" },
                { name: "firstName", label: "Ім’я", defaultValue: user?.firstName || "" },
                ...(!user
                  ? [
                      {
                        name: "email",
                        label: "Email",
                        defaultValue: "",
                      },
                    ]
                  : []),
                { name: "degree", label: "Ступінь", defaultValue: user?.degree || "" },
                { name: "position", label: "Посада", defaultValue: user?.position || "" },
                {
                  name: "role",
                  label: "Роль",
                  type: "select",
                  defaultValue: user?.role || Role.TEACHER,
                  options: [
                    { label: "Адміністратор", value: Role.ADMIN },
                    { label: "Викладач", value: Role.TEACHER },
                  ],
                },
                {
                  name: "departmentId",
                  label: "Кафедра",
                  type: "select",
                  defaultValue: user ? user.department.id : departments[0]?.id,
                  options: departments.map((dep) => ({ label: dep.name, value: dep.id })),
                },
              ]}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
