import { Role, Degree, Position, User } from "../../types/User";
import { Department } from "../../types/Department";
import { motion, AnimatePresence } from "framer-motion";
import EditModal from "../../components/EditModal";
interface UserFormModalProps {
  isOpen: boolean;
  user: User | null;
  departments: Department[];
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  isSubmitting: boolean;
}

export default function UserFormModal({
  isOpen,
  user,
  departments,
  onClose,
  onSubmit,
  isSubmitting,
}: UserFormModalProps) {
  // Виправлена функція, яка правильно знаходить ключ за значенням в enum
  const getEnumKeyByValue = (enumObj: any, value: string) => {
    const entry = Object.entries(enumObj).find(([_, val]) => val === value);
    return entry ? entry[0] : "";
  };

  const handleSubmit = (data: Partial<User>) => {
    if ('isAuthor' in data) {
      if (typeof data.isAuthor === 'string') {
        data.isAuthor = data.isAuthor === 'true';
      }
      if (typeof data.isAuthor !== 'boolean') {
        data.isAuthor = Boolean(data.isAuthor);
      }
    }
    
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              fields={[
                { name: "lastName", label: "Прізвище", defaultValue: user?.lastName || "" },
                { name: "firstName", label: "Ім'я", defaultValue: user?.firstName || "" },
                ...(!user
                  ? [
                      {
                        name: "email",
                        label: "Email",
                        defaultValue: "",
                      },
                    ]
                  : []),
                {
                  name: "degree",
                  label: "Науковий ступінь",
                  type: "select",
                  defaultValue: user ? getEnumKeyByValue(Degree, user.degree) : "NONE",
                  options: Object.entries(Degree).map(([key, value]) => ({
                    label: value,
                    value: key,
                  })),
                },
                {
                  name: "position",
                  label: "Посада",
                  type: "select",
                  defaultValue: user ? getEnumKeyByValue(Position, user.position) : "LECTURER",
                  options: Object.entries(Position).map(([key, value]) => ({
                    label: value,
                    value: key,
                  })),
                },
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
                {
                  name: "isAuthor",
                  label: "Автор рейтингу",
                  type: "checkbox",
                  defaultValue: user?.isAuthor || false,
                },
              ]}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}