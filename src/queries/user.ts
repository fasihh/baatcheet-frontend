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


const loginMutation = {
  mutationFn: async ({ username, password }: { username: string; password: string }) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    return response.json();
  },
} as UseMutationOptions<any, Error, { username: string; password: string }>;

export default loginMutation;