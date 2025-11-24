import { fetcher } from "@/lib/utils";
import { type UseSuspenseQueryOptions } from "@tanstack/react-query";
import { type UseMutationOptions } from "@tanstack/react-query";

export const getGuilds = (token: string) => ({
  queryKey: ['guilds'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/guilds/user`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const getGuildByIdQuery = (token: string, guildId: string) => ({
  queryKey: ['guilds', guildId],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/guilds/${guildId}`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const createGuildMutation = (token: string) => ({
  mutationFn: async ({ guildName }: { guildName: string }) => {
    return fetcher("POST", `${import.meta.env.VITE_API_URL}/guilds`, token, { body: JSON.stringify({ guildName }) });
  },
} as UseMutationOptions<any, Error, { guildName: string }>);

export const getRolesByMemberId = (token: string, guildId: string, memberId: string) => ({
  queryKey: ['guilds', guildId, 'members', memberId, 'roles'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/roles/${memberId}`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const getGuildMembersQuery = (token: string, guildId: string) => ({
  queryKey: ['guilds', guildId, 'members'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/members`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const joinGuildMutation = (token: string) => ({
  mutationFn: async ({ guildId }: { guildId: string }) => {
    return fetcher("POST", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/join`, token);
  },
} as UseMutationOptions<any, Error, { guildId: string }>);

export const getGuildPermissionsQuery = (token: string, guildId: string) => ({
  queryKey: ['guilds', guildId, 'permissions'],
  queryFn: async () => {
    return fetcher("GET", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/permissions`, token);
  },
} as UseSuspenseQueryOptions<any, Error>);

export const removeUserFromGuildMutation = (token: string) => ({
  mutationFn: async ({ guildId, userId }: { guildId: string, userId: string }) => {
    return fetcher("DELETE", `${import.meta.env.VITE_API_URL}/guilds/${guildId}/members/${userId}`, token);
  },
} as UseMutationOptions<any, Error, { guildId: string, userId: string }>);
