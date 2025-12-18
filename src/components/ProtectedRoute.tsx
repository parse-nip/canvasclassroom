import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  session: Session | null;
  requiredRole?: 'teacher' | 'student';
  loading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  session, 
  requiredRole,
  loading = false 
}) => {
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const userRole = session.user.user_metadata?.role;
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'teacher') {
        return <Navigate to="/teacher" replace />;
      } else if (userRole === 'student') {
        return <Navigate to="/student" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

