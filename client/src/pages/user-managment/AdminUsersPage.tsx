import { useState, useEffect } from "react";
import { api } from "../../services/api/api";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { Role, User } from "../../types/User";
import * as yup from "yup";
import { Department } from "../../types/Department";

import UserSearch from "./UserSearch";
import UserList from "./UserList";
import UserFormModal from "./UserFormModal";
import DeleteUserModal from "./DeleteUserModal";

import { PlusIcon,UserGroupIcon } from "@heroicons/react/24/outline";

const userSchema = yup.object({
  lastName: yup.string().required("Прізвище обов’язкове"),
  firstName: yup.string().required("Ім’я обов’язкове"),
  role: yup.string().oneOf(Object.values(Role), "Невірна роль"),
  departmentId: yup.number().required("Кафедра обов’язкова"),
  degree: yup.string().required("Ступінь обов’язковий"),
  position: yup.string().required("Посада обов’язкова"),
});


export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState({ edit: false, confirm: false });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch {
      toast.error("Не вдалося завантажити користувачів");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get<Department[]>("/departments");
      setDepartments(res.data);
    } catch {
      toast.error("Не вдалося завантажити кафедри");
    }
  };

  const handleUserSubmit = async (data: Partial<User>) => {
    try {
      const parsedData = await userSchema.validate(data, { abortEarly: false });
      const formattedData = {
        ...parsedData,
        departmentId: Number(parsedData.departmentId),
      };
  
      if (selectedUser) {
        await api.patch(`/users/${selectedUser.id}`, formattedData);
        toast.success("Користувача оновлено");
      } else {
        await api.post("/users", formattedData);
        toast.success("Користувача створено. Пароль надіслано на email.");
      }
  
      setModalState((prev) => ({ ...prev, edit: false }));
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.name === "ValidationError") {
        err.inner.forEach((e: any) => toast.error(e.message));
      } else {
        toast.error("Помилка при збереженні користувача");
      }
    }
  };
  
  
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/users/${deleteUserId}`);
      toast.success("Користувача видалено");
      fetchUsers();
    } catch {
      toast.error("Помилка при видаленні користувача");
    } finally {
      setModalState({ ...modalState, confirm: false });
    }
  };

  const filteredUsers = users.filter((user) =>
    [user.firstName, user.lastName, user.email]
      .some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-xl">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Управління користувачами
              </h1>
              <p className="text-gray-500">
                Загалом {users.length} користувачів
              </p>
            </div>
          </div>

          <Button 
            onClick={() => {
              setSelectedUser(null);
              setModalState({ ...modalState, edit: true });
            }}
            icon={<PlusIcon className="w-5 h-5" />}
            className="flex items-center space-x-2 
                       bg-blue-600 text-white 
                       hover:bg-blue-700 
                       transition-colors duration-300"
          >
            Додати користувача
          </Button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <UserSearch 
            search={search} 
            onChange={setSearch} 
          />
        </div>

        {/* User List */}
        <UserList
          users={filteredUsers}
          onEdit={(user) => {
            setSelectedUser(user);
            setModalState({ ...modalState, edit: true });
          }}
          onDelete={(userId) => {
            setDeleteUserId(userId);
            setModalState({ ...modalState, confirm: true });
          }}
        />

        {/* Modals */}
        <UserFormModal
          isOpen={modalState.edit}
          onClose={() => setModalState({ ...modalState, edit: false })}
          onSubmit={handleUserSubmit}
          departments={departments}
          user={selectedUser}
        />
        <DeleteUserModal
          isOpen={modalState.confirm}
          onClose={() => setModalState({ ...modalState, confirm: false })}
          onSubmit={handleDeleteUser}
        />
      </div>
    </div>
  );
}
