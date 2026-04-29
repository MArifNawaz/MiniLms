import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../context/AuthContext';

export default function AuthGuard({ children, allowedRoles }) {
  const { user, status } = useAuthState();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
