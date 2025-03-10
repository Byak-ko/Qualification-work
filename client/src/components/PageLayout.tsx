import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../components/AuthProvider"

const PageLayout = () => {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Система рейтингування</h1>
        <div className="flex items-center gap-4">
          <span>{currentUser?.firstName} {currentUser?.lastName}</span>
          <button
            onClick={() => {
              logout()
              navigate("/login")
            }}
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
          >
            Вийти
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>

      <footer className="bg-gray-200 text-center py-3 text-sm text-gray-600">
        © 2025 Розроблено для дипломного проєкту
      </footer>
    </div>
  )
}

export default PageLayout
