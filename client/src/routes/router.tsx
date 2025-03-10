import { createBrowserRouter } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import { teacherRoutes } from "./teacherRoutes"
import { adminRoutes } from "./adminRoutes"
import { fallbackRoute } from "./fallbackRoute"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  ...teacherRoutes,
  ...adminRoutes,
  ...fallbackRoute,
])
