import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../components/AuthProvider"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import Spinner from "../components/ui/Spinner"

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Невірні дані для входу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center px-4">
      {/* Бекграунд кола */}
      <div className="absolute -top-28 -left-28 w-72 h-72 bg-indigo-300 rounded-full opacity-20 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-blue-300 rounded-full opacity-20 blur-3xl" />

      {/* Основна форма */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">Вхід до системи</h2>

        {error && (
          <div className="text-red-600 text-center font-medium mb-4 bg-red-100 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" full disabled={loading}>
            {loading ? <Spinner /> : "Увійти"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
