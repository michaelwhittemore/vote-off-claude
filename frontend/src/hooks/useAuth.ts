import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

interface User { id: string; email: string; }

export function useAuth() {
  return useQuery<User | null>({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const { data } = await client.get('/auth/me');
        return data;
      } catch {
        return null;
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      client.post('/auth/login', creds).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      client.post('/auth/register', creds).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => client.post('/auth/logout'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  });
}
