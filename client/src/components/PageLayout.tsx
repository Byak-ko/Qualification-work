import { useState, useEffect } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "./AuthProvider"
import { useTheme } from "./ThemeProvider"
import { Role } from "../types/User"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

const PageLayout = () => {
  const { currentUser, logout } = useAuth()
   const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    NProgress.start()
    setTimeout(() => NProgress.done(), 500)
  }, [location.pathname])

  const baseMenu = [{ label: "🏠 Головна", path: "/" }]

  const roleMenu = currentUser?.role.includes(Role.ADMIN)
    ? [
        { label: "👥 Користувачі", path: "/users" },
        { label: "📊 Рейтинги", path: "/ratings" },
      ]
    : [
        { label: "👤 Кабінет", path: "/me" },
        { label: "📝 Мої звіти", path: "/reports" },
      ]

  const menuItems = [...baseMenu, ...roleMenu]

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { x: "100%", transition: { duration: 0.3 } },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative overflow-x-hidden">
      {/* Кнопка-гамбургер */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 z-20 p-3 bg-indigo-600 dark:bg-indigo-500 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:outline-none shadow-lg transition-all"
      >
        ☰
      </button>

      {/* Оверлей для закриття меню */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-5 bg-black/20 backdrop-blur-sm"
        />
      )}

      {/* Бокове меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            key="sidebar"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="fixed top-0 right-0 h-full w-64 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-indigo-200 dark:border-gray-700 shadow-2xl rounded-l-3xl"
          >
            <div className="p-6 space-y-4">
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
                📘 Навігація
              </div>

              {menuItems.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-lg font-medium transition-all border border-transparent hover:scale-105 hover:shadow-md ${
                      isActive
                        ? "bg-indigo-200 dark:bg-indigo-700 text-indigo-900 dark:text-white shadow-sm"
                        : "hover:bg-indigo-50 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="h-px bg-indigo-100 dark:bg-gray-600 my-2" />

              {/* Перемикач теми */}
              <button
                onClick={toggleTheme}
                className="block w-full text-left px-4 py-3 rounded-xl text-lg font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                {theme === "light" ? "🌙 Темна тема" : "☀️ Світла тема"}
              </button>

              <div className="h-px bg-indigo-100 dark:bg-gray-600 my-2" />

              {/* Кнопка виходу */}
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  logout()
                }}
                className="block w-full text-left px-4 py-3 rounded-xl text-lg font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-all"
              >
                🚪 Вийти
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Контент сторінки */}
      <main className="p-6 flex-grow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-lg shadow-md m-4">
        <Outlet />
      </main>
    </div>
  )
}

export default PageLayout
