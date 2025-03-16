import { createBrowserRouter } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import HomePage from "../pages/HomePage";
import AdminUsersPage from "../pages/AdminUsersPage";
import CreateRatingPage from "../pages/CreateRatingPage";
import ReportsPage from "../pages/ReportsPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import PageFallback from "../components/PageFallback";
import { Role } from "../types/User";
import UnitsDepartmentsPage from "../pages/UnitsDepartmentsPage";
import FillRatingPage from "../pages/FillRatingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "units",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <UnitsDepartmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <CreateRatingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings/:id/fill",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <FillRatingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={[Role.TEACHER, Role.ADMIN]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <PageFallback code="404" message="Сторінку не знайдено" />,
  },
]);
