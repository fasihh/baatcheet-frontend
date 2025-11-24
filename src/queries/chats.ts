import { fetcher } from "@/lib/utils";
import { type UseSuspenseQueryOptions } from "@tanstack/react-query";

export const getChatByIdQuery = (token: string, chatId: string) => ({
  queryKey: ['chat', chatId],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/chats/${chatId}`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const getDirectMessagesQuery = (token: string) => ({
  queryKey: ['directMessages'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/chats/dms`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const getGuildChatsQuery = (token: string, guildId: string) => ({
  queryKey: ['guilds', guildId, 'chats'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/chats/guild/${guildId}`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const getMessagesByChatIdQuery = (token: string, chatId: string) => ({
  queryKey: ['chats', chatId, 'messages'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/chats/${chatId}/messages`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);


export const createGuildChatMutation = (token: string, guildId: string) => ({
  mutationFn: async ({ chatName }: { chatName: string }) => {
    return fetcher("POST", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/chat`, token, {
      body: JSON.stringify({ chatName })
    });
  },
});

export const deleteGuildChatMutation = (token: string, guildId: string) => ({
  mutationFn: async (chatId: string) => {
    return fetcher("DELETE", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/chats/${chatId}`, token);
  },
});

export const updateGuildChatMutation = (token: string, guildId: string) => ({
  mutationFn: async ({ chatId, chatName }: { chatId: string, chatName: string }) => {
    return fetcher("PATCH", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/chats/${chatId}`, token, {
      body: JSON.stringify({ chatName })
    });
  },
});
