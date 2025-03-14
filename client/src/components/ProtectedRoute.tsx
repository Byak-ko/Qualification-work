import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import PageFallback from "./PageFallback";
import PageLoader from "../components/PageLoader";
import { User } from "../types/User";
import { PropsWithChildren } from "react";

type ProtectedRouteProps = PropsWithChildren & {
  allowedRoles?: User['role'][]; 
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <PageFallback code="403" message="You don't have permission to visit this page" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
