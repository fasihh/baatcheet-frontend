import { fetcher } from "@/lib/utils";
import { type UseSuspenseQueryOptions } from "@tanstack/react-query";

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

