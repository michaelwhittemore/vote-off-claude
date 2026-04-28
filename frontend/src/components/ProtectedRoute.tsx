import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MOCK = import.meta.env.VITE_MOCK === 'true';

interface Props { children: ReactNode; }

export function ProtectedRoute({ children }: Props) {
  const { data: user, isLoading } = useAuth();

  if (MOCK) return <>{children}</>;
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a0a0c0' }}>Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
