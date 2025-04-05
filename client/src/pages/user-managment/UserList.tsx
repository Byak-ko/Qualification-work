import { User } from "../../types/User";
import UserCard from "./UserCard";
import { AnimatePresence, motion } from "framer-motion";
import { UserGroupIcon } from "@heroicons/react/24/outline";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  return (
    <div className="w-full"> 
      {users.length > 0 ? (
        <motion.ul
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                departmentName={user.department.name}
                onEdit={() => onEdit(user)}
                onDelete={() => onDelete(user.id)}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="bg-white border border-gray-200
                       rounded-lg p-8 text-center">
          <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Користувачів не знайдено
          </h2>
          <p className="text-gray-500">
            У системі ще немає жодного користувача
          </p>
        </div>
      )}
    </div>
  );
}