import { useState } from "react";
import { Role, User } from "../../types/User";
import {
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import UserInfoModal from "./UserInfoModal";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";

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
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className="group relative border-2 border-transparent rounded-xl p-5
                   flex justify-between items-center
                   bg-white shadow-lg hover:shadow-xl
                   hover:border-blue-100
                   transition-all duration-300 ease-in-out
                   hover:bg-blue-50/30"
        onClick={() => setInfoOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setInfoOpen(true);
          }
        }}
      >
        <div className="space-y-2 w-full pr-24">
          <h3 className="text-lg font-bold text-gray-800
                         group-hover:text-blue-700
                         transition-colors duration-300 truncate">
            {user.lastName} {user.firstName}
          </h3>
          <div className="space-y-1.5">
            {[
              {
                icon: <EnvelopeIcon className="w-5 h-5 text-blue-500" />,
                text: user.email
              },
              {
                icon: <UserIcon className="w-5 h-5 text-green-500" />,
                text: user.role === Role.ADMIN ? "Адміністратор" : "Викладач"
              },
              {
                icon: <BuildingOfficeIcon className="w-5 h-5 text-purple-500" />,
                text: departmentName
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-sm text-gray-600
                           group-hover:text-gray-800
                           transition-colors duration-300 truncate"
              >
                {item.icon}
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="absolute top-4 right-4 flex gap-2 opacity-0
                     group-hover:opacity-100
                     transition-opacity duration-300 z-10"
        >
          <div
            className="flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="icon-edit"
              size="sm"
              icon={<PencilIcon className="h-5 w-5" />}
              onClick={onEdit}
            />
            <Button
              variant="icon-danger"
              size="sm"
              icon={<TrashIcon className="h-5 w-5" />}
              onClick={onDelete}
            />
          </div>
        </div>
      </motion.li>
      <UserInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        user={user}
      />
    </>
  );
}