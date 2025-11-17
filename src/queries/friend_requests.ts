import { type UseSuspenseQueryOptions } from "@tanstack/react-query";
import { type UseMutationOptions } from "@tanstack/react-query";

export const getIncomingRequestsQuery = (token: string) => ({
  queryKey: ['friendRequests', 'incoming'],
  queryFn: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch incoming friend requests');
    }
    return res.json();
  },
} as UseSuspenseQueryOptions<any, Error>);

export const sendFriendRequestMutation = (token: string) => ({
    mutationFn: async ({ userId }: { userId: string }) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/requests/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
          throw new Error('Failed to send friend request');
        }

        return res.json();
    },
} as UseMutationOptions<any, Error, { userId: string }>)

export const acceptFriendRequestMutation = (token: string) => ({
  mutationFn: async ({ userId }: { userId: string }) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/requests/${userId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      throw new Error('Failed to accept friend request');
    }

    return res.json();
  },
} as UseMutationOptions<any, Error, { userId: string }>);

export const rejectFriendRequestMutation = (token: string) => ({
  mutationFn: async ({ userId }: { userId: string }) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/requests/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      throw new Error('Failed to reject friend request');
    }
    return res.json();
  },
} as UseMutationOptions<any, Error, { userId: string }>);

export const removeFriendMutation = (token: string) => ({
  mutationFn: async ({ userId }: { userId: string }) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/friends/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      throw new Error('Failed to remove friend');
    }
    return res.json();
  },
} as UseMutationOptions<any, Error, { userId: string }>);