import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline"
import Button from "../../components/ui/Button"
import DepartmentList from "./DepartmentList"
import { Unit, Department } from "./UnitsDepartmentsPage"
import { User } from "../../types/User"
import { motion } from "framer-motion"

export default function UnitCard({
  unit,
  departments,
  users,
  onEdit,
  onDelete,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: {
  unit: Unit
  departments: Department[]
  users: User[]
  onEdit: () => void
  onDelete: () => void
  onAddDepartment: () => void
  onEditDepartment: (dept: Department) => void
  onDeleteDepartment: (id: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white border rounded-xl shadow p-5 transition hover:shadow-md"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <BuildingOffice2Icon className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{unit.name}</h2>
            <p className="text-sm text-gray-500">{unit.type}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" icon={<PencilIcon className="w-4 h-4" />} onClick={onEdit}>
            Редагувати
          </Button>
          <Button size="sm" icon={<TrashIcon className="w-4 h-4" />} onClick={onDelete} variant="danger">
            Видалити
          </Button>
          <Button size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={onAddDepartment}>
            Додати кафедру
          </Button>
        </div>
      </div>

      <DepartmentList
        departments={departments}
        users={users}
        onEdit={onEditDepartment}
        onDelete={onDeleteDepartment}
      />
    </motion.div>
  )
}
