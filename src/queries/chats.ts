import { type UseSuspenseQueryOptions } from "@tanstack/react-query";

export const getDirectMessagesQuery = (token: string) => ({
  queryKey: ['directMessages'],
  queryFn: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chats/dms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch direct messages');
    }

    return res.json();
  },
} as UseSuspenseQueryOptions<any, Error>);

export const getMessagesByChatIdQuery = (token: string, chatId: string) => ({
  queryKey: ['chats', chatId, 'messages'],
  queryFn: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chats/dms/${chatId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch messages');
    }

    return res.json();
  },
} as UseSuspenseQueryOptions<any, Error>);
