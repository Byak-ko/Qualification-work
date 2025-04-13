import { useState, useEffect } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "./AuthProvider"
import { Role } from "../types/User"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import Breadcrumbs from "./Breadcrumbs"
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  UserIcon, 
  DocumentTextIcon, 
  Bars3Icon, 
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

const PageLayout = () => {
  const { currentUser, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  useEffect(() => {
    NProgress.start()
    NProgress.configure({ easing: 'ease', speed: 500 })
    setTimeout(() => NProgress.done(), 500)
    
    const npProgressStyle = document.createElement('style')
    npProgressStyle.textContent = `
      #nprogress .bar {
        background: linear-gradient(to right, #8b5cf6, #ec4899) !important;
        height: 4px !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px #8b5cf6, 0 0 5px #ec4899 !important;
      }
      #nprogress .spinner {
        display: none !important;
      }
    `
    document.head.appendChild(npProgressStyle)
    return () => {
      document.head.removeChild(npProgressStyle)
    }
  }, [location.pathname])

  const baseMenu = 
  [
    { label: "Головна", path: "/", icon: HomeIcon },
    { label: "Рейтинги", path: "/ratings", icon: ChartBarIcon },
    { label: "Звіти", path: "/reports", icon: DocumentTextIcon },
    { label: "Мій кабінет", path: "/profile", icon: UserIcon },
  ]

  const roleMenu = currentUser?.role.includes(Role.ADMIN)
    ? [
        { label: "Користувачі", path: "/users", icon: UsersIcon },
        { label: "Підрозділи", path: "/units", icon: BuildingOfficeIcon },
      ]
    : []

  const menuItems = [...baseMenu, ...roleMenu]

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { x: "100%", transition: { duration: 0.3 } },
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-x-hidden">
      <div className="fixed -top-32 -left-32 w-64 h-64 bg-yellow-200 rounded-full filter blur-3xl opacity-40 z-0 animate-pulse"></div>
      <div className="fixed top-1/4 -right-32 w-72 h-72 bg-pink-200 rounded-full filter blur-3xl opacity-30 z-0"></div>
      <div className="fixed bottom-1/3 -left-32 w-80 h-80 bg-cyan-200 rounded-full filter blur-3xl opacity-30 z-0"></div>
      <div className="fixed bottom-1/4 right-1/4 w-48 h-48 bg-indigo-200 rounded-full filter blur-3xl opacity-20 z-0"></div>
      <div className="fixed top-1/3 left-1/3 w-36 h-36 bg-violet-200 rounded-full filter blur-3xl opacity-25 z-0"></div>
      
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-20 p-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full hover:from-violet-600 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 shadow-lg transition-all duration-300 group"
        aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
      >
        {isMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
        )}
      </button>

      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-5 bg-white/30 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            key="sidebar"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="fixed top-0 right-0 h-full w-72 z-10 bg-white/80 backdrop-blur-xl border-l border-purple-200 shadow-2xl rounded-l-3xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-8 flex items-center gap-2">
                <RocketLaunchIcon className="w-8 h-8 text-purple-500" />
                <span>Навігація</span>
              </div>

              <div className="space-y-3">
                {menuItems.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all border border-transparent hover:scale-105 hover:shadow-md ${
                        isActive
                          ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm border-l-4 border-l-purple-400"
                          : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-indigo-600"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-pink-500' : 'text-blue-500'}`} />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-purple-200 to-pink-200 my-6" />

              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  logout()
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-lg font-medium text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-pink-400 transition-all hover:shadow-md"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
                <span>Вийти</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        className="flex-grow bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl m-4 md:m-6 p-6 transition-all duration-300 border border-purple-100 relative z-1"
      >
        <Breadcrumbs />
        <div className="mt-6">
          <Outlet />
        </div>
      </motion.main>

      <div className="fixed bottom-4 left-4 w-24 h-24 bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full filter blur-2xl opacity-20 z-0 animate-pulse"></div>
      <div className="fixed top-1/2 right-8 w-16 h-16 bg-gradient-to-r from-green-300 to-teal-300 rounded-full filter blur-xl opacity-20 z-0 animate-ping"></div>
    </div>
  )
}

export default PageLayout