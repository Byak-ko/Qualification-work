import { useEffect, useMemo, useState } from "react"
import { api } from "../../services/api/api"
import { toast } from "react-toastify"
import { AnimatePresence } from "framer-motion"
import EditModal from "../../components/EditModal"
import ConfirmModal from "../../components/ConfirmModal"
import SearchBar  from "./SearchBar"
import UnitList from "./UnitList"
import { User } from "../../types/User"

export type Unit = {
  id: number
  name: string
  type: string
}

export type Department = {
  id: number
  name: string
  unit: Unit
}

export default function UnitsDepartmentsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")

  const [editUnitModalOpen, setEditUnitModalOpen] = useState(false)
  const [editDepartmentModalOpen, setEditDepartmentModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [defaultDepartmentUnit, setDefaultDepartmentUnit] = useState<Unit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "unit" | "department"; id: number } | null>(null)

  const fetchData = async () => {
    try {
      const [unitsRes, departmentsRes, usersRes] = await Promise.all([
        api.get<Unit[]>("/units"),
        api.get<Department[]>("/departments"),
        api.get<User[]>("/users"),
      ])
      setUnits(unitsRes.data)
      setDepartments(departmentsRes.data)
      setUsers(usersRes.data)
    } catch {
      toast.error("Помилка при завантаженні даних")
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateUnit = async (data: { name: string; type: string }) => {
    try {
      await api.post("/units", data)
      setEditUnitModalOpen(false)
      toast.success("Підрозділ створено")
      fetchData()
    } catch {
      toast.error("Помилка при створенні підрозділу")
    }
  }

  const handleEditUnit = async (data: { name: string; type: string }) => {
    if (!selectedUnit) return
    try {
      await api.patch(`/units/${selectedUnit.id}`, data)
      setEditUnitModalOpen(false)
      toast.success("Підрозділ оновлено")
      fetchData()
    } catch {
      toast.error("Помилка при оновленні підрозділу")
    }
  }

  const handleDeleteUnit = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/units/${deleteTarget.id}`)
      toast.success("Підрозділ видалено")
      fetchData()
    } catch {
      toast.error("Помилка при видаленні підрозділу")
    } finally {
      setConfirmModalOpen(false)
    }
  }

  const handleCreateDepartment = async (data: { name: string; unit: Unit }) => {
    try {
      await api.post("/departments", data)
      setEditDepartmentModalOpen(false)
      toast.success("Кафедру створено")
      fetchData()
    } catch {
      toast.error("Помилка при створенні кафедри")
    }
  }

  const handleEditDepartment = async (data: { name: string; unit: Unit }) => {
    if (!selectedDepartment) return
    try {
      await api.patch(`/departments/${selectedDepartment.id}`, data)
      setEditDepartmentModalOpen(false)
      toast.success("Кафедру оновлено")
      fetchData()
    } catch {
      toast.error("Помилка при оновленні кафедри")
    }
  }

  const handleDeleteDepartment = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/departments/${deleteTarget.id}`)
      toast.success("Кафедру видалено")
      fetchData()
    } catch {
      toast.error("Помилка при видаленні кафедри")
    } finally {
      setConfirmModalOpen(false)
    }
  }

  const filteredUnits = useMemo(() => {
    return units.filter((unit) =>
      unit.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, units])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Керування підрозділами та кафедрами</h1>
      <hr className="mb-6 border-t border-gray-200" />

      <SearchBar
        value={search}
        onChange={setSearch}
        onCreateUnit={() => {
          setSelectedUnit(null)
          setEditUnitModalOpen(true)
        }}
      />

      <AnimatePresence>
        <UnitList
          units={filteredUnits}
          departments={departments}
          users={users}
          onEditUnit={(unit) => {
            setSelectedUnit(unit)
            setEditUnitModalOpen(true)
          }}
          onDeleteUnit={(id) => {
            setDeleteTarget({ type: "unit", id })
            setConfirmModalOpen(true)
          }}
          onAddDepartment={(unit) => {
            setDefaultDepartmentUnit(unit)
            setSelectedDepartment(null)
            setEditDepartmentModalOpen(true)
          }}
          onEditDepartment={(dept) => {
            setSelectedDepartment(dept)
            setEditDepartmentModalOpen(true)
          }}
          onDeleteDepartment={(id) => {
            setDeleteTarget({ type: "department", id })
            setConfirmModalOpen(true)
          }}
        />
      </AnimatePresence>

      <EditModal
        isOpen={editUnitModalOpen}
        title={selectedUnit ? "Редагувати підрозділ" : "Новий підрозділ"}
        fields={[
          { name: "name", label: "Назва", defaultValue: selectedUnit?.name || "" },
          { name: "type", label: "Тип", defaultValue: selectedUnit?.type || "" },
        ]}
        onSubmit={selectedUnit ? handleEditUnit : handleCreateUnit}
        onClose={() => setEditUnitModalOpen(false)}
      />

      <EditModal<{ name: string; unit: Unit }>
        isOpen={editDepartmentModalOpen}
        title={selectedDepartment ? "Редагувати кафедру" : "Нова кафедра"}
        fields={[
          { name: "name", label: "Назва", defaultValue: selectedDepartment?.name || "" },
          {
            name: "unit",
            label: "Підрозділ",
            type: "select",
            defaultValue: selectedDepartment?.unit?.id ?? defaultDepartmentUnit?.id ?? units[0]?.id,
            options: units.map((u) => ({ label: u.name, value: u.id })),
          },
        ]}
        onSubmit={selectedDepartment ? handleEditDepartment : handleCreateDepartment}
        onClose={() => setEditDepartmentModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Підтвердьте видалення"
        message="Ви впевнені, що хочете видалити цю сутність?"
        onSubmit={deleteTarget?.type === "unit" ? handleDeleteUnit : handleDeleteDepartment}
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  )
}
