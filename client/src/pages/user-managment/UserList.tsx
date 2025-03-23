import { User } from "../../types/User";
import UserCard from "./UserCard";
import { AnimatePresence, motion } from "framer-motion";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  return (
    <motion.ul layout className="grid gap-4">
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
  );
}
