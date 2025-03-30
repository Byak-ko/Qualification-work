import { useState } from "react";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  KeyIcon, 
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { api } from "../../services/api/api";
import { useAuth } from "../../components/AuthProvider";
import { toast } from "react-toastify";

export default function ChangePasswordSection() {
  const { currentUser } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      setSaving(true);
      await api.patch(`/users/${currentUser?.id}/password`, { password, confirmPassword: confirm });
      toast.success("Пароль успішно змінено!");
      setIsChangingPassword(false);
      setPassword("");
      setConfirm("");
    } catch {
      toast.error("Помилка при зміні пароля");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsChangingPassword(false);
    setPassword("");
    setConfirm("");
    setError("");
  };

  return (
    <div>
      {!isChangingPassword ? (
        <Button
          variant="secondary"
          icon={<KeyIcon className="h-5 w-5" />}
          onClick={() => setIsChangingPassword(true)}
          full
        >
          Змінити пароль
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Новий пароль"
              type={showPassword ? "text" : "password"}
              className="w-full pr-10"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Підтвердіть пароль"
              type={showConfirm ? "text" : "password"}
              className="w-full pr-10"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
            />
            <button 
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              full
              isLoading={saving}
              variant="green"
            >
              {saving ? "Збереження..." : "Зберегти"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              full
            >
              Скасувати
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}