import ProtectedRoute from "../components/ProtectedRoute"
import PageLayout from "../components/PageLayout"
import { Role } from "../types/User";

export const teacherRoutes = [
  {
    element: (
      <ProtectedRoute allowedRoles={[Role.TEACHER]}>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/surveys",
      //  element: <SurveyPage />,
      },
    ],
  },
]
