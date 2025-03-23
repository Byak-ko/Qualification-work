import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { api } from "../../services/api/api";
import { useAuth } from "../../components/AuthProvider";

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { currentUser } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (password !== confirm) {
      setError("Паролі не співпадають");
      return;
    }

    if (password.length < 6) {
      setError("Пароль має містити щонайменше 6 символів");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/users/${currentUser?.id}/password`, { password });
      alert("Пароль змінено успішно!");
      onClose();
    } catch {
      setError("Помилка при зміні пароля");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Змінити пароль</h2>

        <Input
          label="Новий пароль"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        <Input
          label="Підтвердіть пароль"
          type="password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError("");
          }}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Збереження..." : "Змінити пароль"}
          </Button>
        </div>
      </div>
    </div>
  );
}
