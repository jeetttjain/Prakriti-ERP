import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../constants/routes";

/**
 * Route protection wrapper validating active login status and force-change credentials states.
 * @component
 */
export default function ProtectedRoute({ children, requireAuth = true }) {
  const { isAdminLoggedIn, currentUser } = useAuthStore();
  const location = useLocation();

  if (requireAuth) {
    if (!isAdminLoggedIn) {
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
    
    // Force change password redirect
    if (currentUser?.mustChangePassword && location.pathname !== ROUTES.CHANGE_PASSWORD) {
      return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
    }
    
    return children;
  } else {
    if (isAdminLoggedIn) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
    return children;
  }
}
