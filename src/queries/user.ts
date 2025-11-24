import { type UseMutationOptions } from '@tanstack/react-query';
import { type UseSuspenseQueryOptions } from '@tanstack/react-query';

export const findUserByName = (token: string) => ({
  mutationFn: async (username: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/users/username/${username}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("User not found");
    return res.json();
  },
});

export const getFriends = (token: string) => ({
  queryKey: ['friends'],
  queryFn: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch friends');
    }
    return res.json();;
  },
} as UseSuspenseQueryOptions<any, Error>);


const loginMutation = (isRegister: boolean) => ({
  mutationFn: async ({ username, password, displayName }: { username: string; password: string, displayName?: string }) => {
    const url = isRegister 
      ? `${import.meta.env.VITE_API_URL}/users`
      : `${import.meta.env.VITE_API_URL}/users/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, name: displayName, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error.info || (isRegister ? 'Failed to register' : 'Failed to login'));
    }

    return data;
  },
} as UseMutationOptions<any, Error, { username: string; displayName: string; password: string }>);

export default loginMutation;