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
import SkeletonCard from "../../components/ui/Skeleton";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Не вдалося завантажити користувачів");
    } finally {
      setIsLoading(false);
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
    setIsSubmitting(true);
    try {
      const parsedData = await userSchema.validate(data, { abortEarly: false });
      const formattedData = {
        ...parsedData,
        departmentId: Number(parsedData.departmentId),
      };
      console.log("Form data",formattedData);
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
    } finally {
      setIsSubmitting(false); 
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

  
  console.log("Filtered users:", filteredUsers);
  return (
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <UserGroupIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Управління користувачами
                </h1>
                <p className="text-blue-100">
                  Загалом {users.length} користувачів у системі
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
                       bg-white text-blue-700
                       hover:bg-blue-50
                       transition-colors duration-300
                       shadow-md rounded-xl px-5 py-2.5"
            >
              Додати користувача
            </Button>
          </div>
        </div>
  
        <div className="p-6">

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <UserSearch
              search={search}
              onChange={setSearch}
            />
          </div>
          
         {isLoading ? (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
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
            </div>

            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Користувачів не знайдено</h3>
                <p className="text-gray-500 max-w-md">
                  Спробуйте змінити параметри пошуку або додайте нового користувача.
                </p>
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setModalState({ ...modalState, edit: true });
                  }}
                  className="mt-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors px-5 py-2.5 rounded-lg"
                >
                  Додати користувача
                </Button>
              </div>
            )}
          </>
        )}
      </div>
  
        <UserFormModal
          isOpen={modalState.edit}
          onClose={() => setModalState({ ...modalState, edit: false })}
          onSubmit={handleUserSubmit}
          departments={departments}
          user={selectedUser}
          isSubmitting={isSubmitting}
        />
        <DeleteUserModal
          isOpen={modalState.confirm}
          onClose={() => setModalState({ ...modalState, confirm: false })}
          onSubmit={handleDeleteUser}
        />
      </div>
  );
}
