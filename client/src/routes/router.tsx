import { createBrowserRouter } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import HomePage from "../pages/home/HomePage";
import AdminUsersPage from "../pages/user-managment/AdminUsersPage";
import CreateRatingPage from "../pages/rating-managment/CreateRatingPage";
import ReportsPage from "../pages/ReportsPage";
import LoginPage from "../pages/login/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import PageFallback from "../components/PageFallback";
import { Role } from "../types/User";
import UnitsDepartmentsPage from "../pages/unit-managment/UnitsDepartmentsPage";
import FillRatingPage from "../pages/fill-rating/FillRatingPage";
import UserProfilePage from "../pages/user-profile/UserProfilePage";
import ReviewRatingPage from "../pages/rating-review/ReviewRatingPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import EditRatingPage from "../pages/rating-managment/EditRatingPage";
import RatingsPage from "../pages/RatingsPage";
import ClosedRatingsPage from "../pages/RatingsClosed";
import AboutPage from "../pages/AboutPage";

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
        path: "ratings/documents",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <ClosedRatingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings",
        element: (
          <ProtectedRoute>
            <RatingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings/create",
        element: (
          <ProtectedRoute>
            <CreateRatingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings/edit",
        element: (
          <ProtectedRoute>
            <EditRatingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings/fill",
        element: (
          <ProtectedRoute>
            <FillRatingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ratings/review",
        element: (
          <ProtectedRoute>
            <ReviewRatingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "*",
    element: <PageFallback code="404" message="Сторінку не знайдено" />,
  },
]);