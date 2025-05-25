import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type RootState } from '../store'
import { type ReactNode } from 'react'
import { toast } from 'react-toastify'

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}