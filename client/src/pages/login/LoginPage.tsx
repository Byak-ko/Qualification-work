import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../components/AuthProvider"
import Input from "../../components/ui/Input"
import Button from "../../components/ui/Button"
import Spinner from "../../components/ui/Spinner"
import { toast } from "react-toastify"
import { EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import ForgotPasswordModal from "./ForgotPasswordModal"

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotModalOpen, setForgotModalOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
  
    setError("");
    setLoading(true);
  
    try {
      const response = await login(email, password);
  
      if (response.error) {
        throw new Error(response.message); // Викликаємо помилку
      }
  
      navigate("/"); // Перенаправлення тільки при успішному вході
    } catch (err: any) {
      const message = err.message || "Невірний email або пароль";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-200 rounded-full opacity-30 filter blur-xl" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-200 rounded-full opacity-30 filter blur-xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 border border-indigo-100"
      >
        <h1 className="text-center text-indigo-600 font-bold text-2xl mb-4">
          📚 UniRate
        </h1>

        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Вхід до системи
        </h2>

        {error && (
          <div className="text-red-600 text-center font-medium mb-4 bg-red-100 px-4 py-2 rounded-lg animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            icon={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Пароль"
            type={showPassword ? "text" : "password"}
            icon={<LockClosedIcon className="w-5 h-5 text-gray-400" />}
            rightIcon={
              showPassword ? (
                <EyeSlashIcon
                  className="w-5 h-5 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeIcon
                  className="w-5 h-5 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-between items-center text-sm text-gray-500">
            <span />
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-indigo-600 hover:underline transition"
            >
              Забули пароль?
            </button>
          </div>

          <Button
            type="submit"
            full
            disabled={loading || !email || !password}
          >
            {loading ? <Spinner size="small"/> : "Увійти"}
          </Button>
        </form>
      </motion.div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
      />
    </div>
  )
}

export default LoginPage
