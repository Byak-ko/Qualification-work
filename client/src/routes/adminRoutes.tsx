import ProtectedRoute from "../components/ProtectedRoute"
import PageLayout from "../components/PageLayout"
import { Role } from "../types/User";

export const adminRoutes = [
  {
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN]}>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/users",
        //element: <UsersPage />,
      },
    ],
  },
]
