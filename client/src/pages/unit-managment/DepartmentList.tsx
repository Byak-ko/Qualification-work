import DepartmentCard from "./DepartmentCard"
import { Department } from "./UnitsDepartmentsPage"
import { User } from "../../types/User"

export default function DepartmentList({
  departments,
  users,
  onEdit,
  onDelete,
}: {
  departments: Department[]
  users: User[]
  onEdit: (dept: Department) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((dept) => {
        const deptUsers = users.filter((u) => u.department?.id === dept.id)
        return (
          <DepartmentCard
            key={dept.id}
            department={dept}
            users={deptUsers}
            onEdit={() => onEdit(dept)}
            onDelete={() => onDelete(dept.id)}
          />
        )
      })}
    </div>
  )
}
