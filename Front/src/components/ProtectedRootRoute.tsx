import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

interface ProtectedRootRouteProps {
  children: React.ReactNode;
}

const ProtectedRootRoute = ({ children }: ProtectedRootRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { role } = useRole();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'root') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRootRoute;