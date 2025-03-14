import { useEffect, useMemo, useState } from "react"
import { api } from "../services/api/api"
import Button from "../components/ui/Button"
import EditModal from "../components/EditModal"
import ConfirmModal from "../components/ConfirmModal"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { User } from "../types/User"

type Unit = {
  id: number
  name: string
  type: string
}

type Department = {
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
      console.log("Users: ", usersRes.data)
    } catch (err) {
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
      <h1 className="text-3xl font-bold mb-6">Керування підрозділами та кафедрами</h1>

      <div className="flex justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Пошук підрозділів..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-md"
        />
        <Button onClick={() => {
          setSelectedUnit(null)
          setEditUnitModalOpen(true)
        }}>+ Додати підрозділ</Button>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {filteredUnits.map((unit) => {
            const unitDepartments = departments.filter((d) => d.unit.id === unit.id)

            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 border rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{unit.name}</h2>
                    <p className="text-sm text-gray-500">{unit.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setSelectedUnit(unit)
                      setEditUnitModalOpen(true)
                    }}>Редагувати</Button>
                    <Button onClick={() => {
                      setDeleteTarget({ type: "unit", id: unit.id })
                      setConfirmModalOpen(true)
                    }}>Видалити</Button>
                    <Button onClick={() => {
                      setSelectedDepartment(null)
                      setEditDepartmentModalOpen(true)
                    }}>+ Додати кафедру</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unitDepartments.map((dept) => {
                     const deptUsers = users.filter((u) => u.department?.id === dept.id)
                    console.log("Dept users: ",deptUsers)
                    console.log("Depart id: ", dept.id)
                    console.log("Users: ", users)
                    return (
                      <motion.div
                        key={dept.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 dark:bg-gray-700 border rounded p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">{dept.name}</h3>
                          <div className="flex gap-2">
                            <Button onClick={() => {
                              setSelectedDepartment(dept)
                              setEditDepartmentModalOpen(true)
                            }}>Редагувати</Button>
                            <Button onClick={() => {
                              setDeleteTarget({ type: "department", id: dept.id })
                              setConfirmModalOpen(true)
                            }}>Видалити</Button>
                          </div>
                        </div>
                        {deptUsers.length > 0 ? (
                          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {deptUsers.map((u) => (
                              <li key={u.id}>• {u.firstName} {u.lastName}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Немає користувачів</p>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      
      <EditModal
        isOpen={editUnitModalOpen}
        title={selectedUnit ? "Редагувати підрозділ" : "Новий підрозділ"}
        fields={[
          {
            name: "name",
            label: "Назва",
            defaultValue: selectedUnit?.name || "",
          },
          {
            name: "type",
            label: "Тип",
            defaultValue: selectedUnit?.type || "",
          },
        ]}
        onSubmit={selectedUnit ? handleEditUnit : handleCreateUnit}
        onClose={() => setEditUnitModalOpen(false)}
      />

      <EditModal<{ name: string; unit: Unit }>
        isOpen={editDepartmentModalOpen}
        title={selectedDepartment ? "Редагувати кафедру" : "Нова кафедра"}
        fields={[
          {
            name: "name",
            label: "Назва",
            defaultValue: selectedDepartment?.name || "",
          },
          {
            name: "unit",
            label: "Підрозділ",
            type: "select",
            defaultValue: selectedDepartment?.unit?.id ?? (units.length > 0 ? units[0].id : undefined),
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
        onSubmit={
          deleteTarget?.type === "unit" ? handleDeleteUnit : handleDeleteDepartment
        }
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  )
}
