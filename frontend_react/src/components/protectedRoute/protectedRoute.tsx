import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './../../context/authContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;