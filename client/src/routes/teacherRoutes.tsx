import ProtectedRoute from "../components/ProtectedRoute"
import PageLayout from "../components/PageLayout"
import { Role } from "../types/User";
import TeacherPage from "../pages/TeacherPage"

export const teacherRoutes = [
  {
    element: (
      <ProtectedRoute allowedRoles={[Role.TEACHER]}>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/me",
        element: <TeacherPage />,
      },
    ],
  },
]
