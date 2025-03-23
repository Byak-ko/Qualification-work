import {
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import Button from "../../components/ui/Button"
import { Department } from "./UnitsDepartmentsPage"
import { User } from "../../types/User"
import { motion } from "framer-motion"

export default function DepartmentCard({
  department,
  users,
  onEdit,
  onDelete,
}: {
  department: Department
  users: User[]
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white border rounded-lg shadow-sm p-4 transition hover:shadow-md"
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{department.name}</h3>
          <p className="text-sm text-gray-500">{users.length} працівник(ів)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} size="sm" icon={<PencilIcon className="w-4 h-4" />}>
          </Button>
          <Button onClick={onDelete} size="sm" icon={<TrashIcon className="w-4 h-4" />} variant="danger">
          </Button>
        </div>
      </div>

      {users.length > 0 ? (
        <ul className="text-sm text-gray-700 space-y-1">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-400" />
              {u.firstName} {u.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 italic">Немає користувачів</p>
      )}
    </motion.div>
  )
}
