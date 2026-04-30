import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MOCK = import.meta.env.VITE_MOCK === 'true';

interface Props { children: ReactNode; }

export function PublicRoute({ children }: Props) {
  const { data: user, isLoading } = useAuth();

  if (MOCK) return <>{children}</>;
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
