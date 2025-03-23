import UnitCard from "./UnitCard"
import { Department, Unit } from "./UnitsDepartmentsPage"
import { User } from "../../types/User"

export default function UnitList({
  units,
  departments,
  users,
  onEditUnit,
  onDeleteUnit,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: {
  units: Unit[]
  departments: Department[]
  users: User[]
  onEditUnit: (unit: Unit) => void
  onDeleteUnit: (id: number) => void
  onAddDepartment: (unit: Unit) => void
  onEditDepartment: (dept: Department) => void
  onDeleteDepartment: (id: number) => void
}) {
  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const unitDepartments = departments.filter((d) => d.unit.id === unit.id)
        return (
          <UnitCard
            key={unit.id}
            unit={unit}
            departments={unitDepartments}
            users={users}
            onEdit={() => onEditUnit(unit)}
            onDelete={() => onDeleteUnit(unit.id)}
            onAddDepartment={() => onAddDepartment(unit)}
            onEditDepartment={onEditDepartment}
            onDeleteDepartment={onDeleteDepartment}
          />
        )
      })}
    </div>
  )
}
