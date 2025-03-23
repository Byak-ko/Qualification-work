import { useState } from "react";
import { Role, User } from "../../types/User";
import {
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import UserInfoModal from "./UserInfoModal";
import { motion } from "framer-motion";

interface UserCardProps {
  user: User;
  departmentName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserCard({
  user,
  departmentName,
  onEdit,
  onDelete,
}: UserCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
      layout
      className="border rounded p-4 flex justify-between text-gray-600 items-center bg-white cursor-pointer"
        onClick={() => setInfoOpen(true)}
      >
        <div>
          <p className="font-semibold">{user.lastName} {user.firstName}</p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4" /> {user.email}
          </p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <UserIcon className="w-4 h-4" /> {user.role === Role.ADMIN ? "Адміністратор" : "Викладач"}
          </p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <BuildingOfficeIcon className="w-4 h-4" /> {departmentName}
          </p>
        </div>
        <div className="flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
          <Button onClick={onEdit} icon={<PencilIcon />} variant="secondary">Редагувати</Button>
          <Button onClick={onDelete} icon={<TrashIcon />} variant="danger">Видалити</Button>
        </div>
        </motion.li>

      <UserInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        user={user}
        departmentName={departmentName}
      />
    </>
  );
}
