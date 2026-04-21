import { type ReactNode, useEffect, useRef } from 'react';
import { useAuth, useLogin } from '../hooks/useAuth';

const MOCK = import.meta.env.VITE_MOCK === 'true';
const DEV_EMAIL = 'test@example.com';
const DEV_PASSWORD = 'password';

interface Props { children: ReactNode; }

export function ProtectedRoute({ children }: Props) {
  const { data: user, isLoading } = useAuth();
  const { mutate: login, isPending, isError } = useLogin();
  const attempted = useRef(false);

  useEffect(() => {
    if (!MOCK && !isLoading && !user && !attempted.current) {
      attempted.current = true;
      login({ email: DEV_EMAIL, password: DEV_PASSWORD });
    }
  }, [isLoading, user, login]);

  if (MOCK) return <>{children}</>;
  if (isLoading || isPending || (!user && !isError)) {
    return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a0a0c0' }}>Loading...</div>;
  }

  return <>{children}</>;
}
