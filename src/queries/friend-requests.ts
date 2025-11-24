import { fetcher } from "@/lib/utils";
import { type UseSuspenseQueryOptions } from "@tanstack/react-query";
import { type UseMutationOptions } from "@tanstack/react-query";

export const getIncomingRequestsQuery = (token: string) => ({
  queryKey: ['friendRequests', 'incoming'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/users/friends/requests`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const sendFriendRequestMutation = (token: string) => ({
    mutationFn: async ({ userId }: { userId: string }) => {
      return fetcher("POST", `${import.meta.env.VITE_API_URL}/users/friends/requests/${userId}`, token);
    },
} as UseMutationOptions<any, Error, { userId: string }>)

export const acceptFriendRequestMutation = (token: string) => ({
  mutationFn: async ({ userId }: { userId: string }) => {
    return fetcher("POST", `${import.meta.env.VITE_API_URL}/users/friends/requests/${userId}/accept`, token);
  },
} as UseMutationOptions<any, Error, { userId: string }>);

export const rejectFriendRequestMutation = (token: string) => ({
  mutationFn: async ({ userId }: { userId: string }) => {
    return fetcher("POST", `${import.meta.env.VITE_API_URL}/users/friends/requests/${userId}/reject`, token);
  },
} as UseMutationOptions<any, Error, { userId: string }>);

export const removeFriendMutation = (token: string) => ({
  mutationFn: async ({ userId }: { userId: string }) => {
    return fetcher("DELETE", `${import.meta.env.VITE_API_URL}/users/friends/${userId}`, token);
  },
} as UseMutationOptions<any, Error, { userId: string }>);