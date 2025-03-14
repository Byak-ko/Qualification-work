import { useState, useEffect } from "react";
import { api } from "../services/api/api";
import Button from "../components/ui/Button";
import EditModal from "../components/EditModal";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-toastify";
import { Role, User } from "../types/User";
import * as yup from "yup";

type Department = {
  id: number;
  name: string;
};

const userSchema = yup.object({
  lastName: yup.string().required("Прізвище обов’язкове"),
  firstName: yup.string().required("Ім’я обов’язкове"),
  email: yup.string().email("Некоректний email").required("Email обов’язковий"),
  password: yup.string().min(6, "Пароль має містити мінімум 6 символів").optional(),
  role: yup.string().oneOf(Object.values(Role), "Невірна роль"),
  departmentId: yup.number().required("Кафедра обов’язкова"),
  degree: yup.string().required("Ступінь обов’язковий"),
  position: yup.string().required("Посада обов’язкова"),
});

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");

  const [modalState, setModalState] = useState({
    edit: false,
    confirm: false,
  });

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

  const handleUserSubmit = async (data: Partial<User> & { password?: string }) => {
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
        toast.success("Користувача створено");
      }

      setModalState((prev) => ({ ...prev, edit: false }));
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message); 
      } else if (err.name === "ValidationError") {
        err.inner.forEach((validationErr: any) => {
          toast.error(validationErr.message);
        });
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
      .some(field => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Користувачі</h1>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setModalState({ ...modalState, edit: true });
          }}
        >
          + Додати користувача
        </Button>
      </div>

      <input
        type="text"
        placeholder="Пошук користувача..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded"
      />

      <ul className="space-y-3">
        {filteredUsers.map((user) => (
          <li key={user.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {user.lastName} {user.firstName}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm">
                {user.role === Role.ADMIN ? "Адміністратор" : "Викладач"} —{" "}
                {departments.find((d) => d.id === user.departmentId)?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedUser(user);
                  setModalState({ ...modalState, edit: true });
                }}
              >
                Редагувати
              </Button>
              <Button
                onClick={() => {
                  setDeleteUserId(user.id);
                  setModalState({ ...modalState, confirm: true });
                }}
              >
                Видалити
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Модальні */}
      <EditModal
        isOpen={modalState.edit}
        title={selectedUser ? "Редагувати користувача" : "Новий користувач"}
        fields={[
          { name: "lastName", label: "Прізвище", defaultValue: selectedUser?.lastName || "" },
          { name: "firstName", label: "Ім’я", defaultValue: selectedUser?.firstName || "" },
          { name: "email", label: "Email", defaultValue: selectedUser?.email || "" },
          { name: "password", label: "Пароль", type: "text" },
          { name: "degree", label: "Ступінь", defaultValue: selectedUser?.degree || "" },
          { name: "position", label: "Посада", defaultValue: selectedUser?.position || "" },
          { 
            name: "role", 
            label: "Роль", 
            type: "select",
            defaultValue: selectedUser?.role || Role.TEACHER,
            options: [
              { label: "Адміністратор", value: Role.ADMIN },
              { label: "Викладач", value: Role.TEACHER },
            ],
          },
          { 
            name: "departmentId",
            label: "Кафедра",
            type: "select",
            defaultValue: selectedUser?.departmentId || departments[0]?.id,
            options: departments.map((dep) => ({ label: dep.name, value: dep.id })),
          },
        ]}

        onSubmit={handleUserSubmit}
        onClose={() => setModalState({ ...modalState, edit: false })}
      />

      <ConfirmModal
        isOpen={modalState.confirm}
        title="Підтвердження видалення"
        message="Ви дійсно хочете видалити користувача?"
        onSubmit={handleDeleteUser}
        onClose={() => setModalState({ ...modalState, confirm: false })}
      />
    </div>
  );
}
