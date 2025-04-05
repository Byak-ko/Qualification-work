import { useEffect, useMemo, useState } from "react"
import { api } from "../../services/api/api"
import EditModal from "../../components/EditModal"
import ConfirmModal from "../../components/ConfirmModal"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { User } from "../../types/User"
import Spinner from "../../components/ui/Spinner"
import SkeletonCard from "../../components/ui/Skeleton"
import {
  BuildingOffice2Icon,
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';

enum UnitType {
  FACULTY = 'Факультет',
  INSTITUTE = 'Інститут'
}

type Unit = {
  id: number
  name: string
  type: keyof typeof UnitType
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
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("")

  const [editUnitModalOpen, setEditUnitModalOpen] = useState(false)
  const [editDepartmentModalOpen, setEditDepartmentModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [defaultDepartmentUnit, setDefaultDepartmentUnit] = useState<Unit | null>(null)

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "unit" | "department"; id: number } | null>(null)

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [unitsRes, departmentsRes, usersRes] = await Promise.all([
        api.get("/units"),
        api.get("/departments"),
        api.get("/users"),
      ]);
      setUnits(unitsRes.data);
      setDepartments(departmentsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error("Помилка при завантаженні даних");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="container mx-auto max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
        <div className="flex items-center">
          <BuildingOffice2Icon className="mr-4 h-10 w-10" />
          <h1 className="text-3xl font-bold">Керування підрозділами та кафедрами</h1>
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-lg">
            <Spinner color="primary" size="small" />
            <span>Завантаження...</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6 space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Пошук підрозділів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 text-black border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <button
            onClick={() => {
              setSelectedUnit(null)
              setEditUnitModalOpen(true)
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Додати підрозділ</span>
          </button>
        </div>

        {isLoading ? (
          <div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredUnits.map((unit) => {
                const unitDepartments = departments.filter((d) => d.unit.id === unit.id)

                return (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="bg-blue-50 p-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-blue-800 flex items-center">
                          <AcademicCapIcon className="mr-3 h-8 w-8 text-blue-600" />
                          {unit.name}
                        </h2>
                        <p className="text-blue-500">{UnitType[unit.type as keyof typeof UnitType]}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUnit(unit)
                            setEditUnitModalOpen(true)
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition flex items-center space-x-2"
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span>Редагувати</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: "unit", id: unit.id })
                            setConfirmModalOpen(true)
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition flex items-center space-x-2"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span>Видалити</span>
                        </button>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition flex items-center space-x-2"
                          onClick={() => {
                            setSelectedDepartment(null)
                            setEditDepartmentModalOpen(true)
                            setDefaultDepartmentUnit(unit)
                          }}> <PlusIcon className="h-5 w-5" />
                          <span>
                            Додати кафедру
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unitDepartments.map((dept) => {
                        const deptUsers = users.filter((u) => u.department?.id === dept.id)

                        return (
                          <motion.div
                            key={dept.id}
                            whileHover={{ scale: 1.05 }}
                            className="group bg-white border border-blue-100 rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-xl font-semibold text-blue-700 flex items-center">
                                <AcademicCapIcon className="mr-2 h-6 w-6 text-blue-500" />
                                {dept.name}
                              </h3>
                              <div className="flex space-x-2">
                                <div className="opacity-0 group-hover:opacity-100 
                     transition-opacity duration-300 
                     flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedDepartment(dept)
                                      setEditDepartmentModalOpen(true)
                                    }}
                                    className="text-yellow-500 bg-yellow-50 p-1.5 rounded-md transition-colors duration-200"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteTarget({ type: "department", id: dept.id })
                                      setConfirmModalOpen(true)
                                    }}
                                    className="text-red-500 bg-red-50 p-1.5 rounded-md transition-colors duration-200"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {deptUsers.length > 0 ? (
                              <ul className="space-y-2">
                                {deptUsers.map((u) => (
                                  <li
                                    key={u.id}
                                    className="flex items-center text-gray-700 space-x-2"
                                  >
                                    <UserIcon className="h-5 w-5 text-blue-400" />
                                    <span>{u.firstName} {u.lastName}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-400 italic flex items-center space-x-2">
                                <UserIcon className="h-5 w-5" />
                                <span>Немає користувачів</span>
                              </p>
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
        )}
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
            type: "select",
            defaultValue: selectedUnit?.type || "FACULTY",
            options: Object.entries(UnitType).map(([key, value]) => ({
              label: value,
              value: key
            })),
          },
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
        type="danger"
        onSubmit={
          deleteTarget?.type === "unit" ? handleDeleteUnit : handleDeleteDepartment
        }
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  )
}