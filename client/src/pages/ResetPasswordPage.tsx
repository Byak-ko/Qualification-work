import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { resetPassword } from "../services/api/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Токен не знайдено!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Паролі не співпадають!");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success("Пароль успішно змінено!");
      navigate("/login"); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Помилка скидання пароля.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4">
          Введіть новий пароль
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Новий пароль"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Повторіть пароль"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" full disabled={loading || !password || !confirmPassword}>
            {loading ? "Змінюємо..." : "Змінити пароль"}
          </Button>
        </form>
      </div>
    </div>
  );
}
