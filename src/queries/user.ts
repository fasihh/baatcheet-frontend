import { type UseMutationOptions } from '@tanstack/react-query';

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