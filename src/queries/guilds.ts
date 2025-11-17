import { type UseSuspenseQueryOptions } from "@tanstack/react-query";
import { type UseMutationOptions } from "@tanstack/react-query";

export const getGuilds = (token: string) => ({
  queryKey: ['guilds'],
  queryFn: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/guilds`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch guilds');
    return res.json();
  },
} as UseSuspenseQueryOptions<any, Error>);

export const createGuildMutation = (token: string) => ({
    mutationFn: async ({ guildName }: { guildName: string }) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/guilds`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ guildName }),
        });
        if (!res.ok) throw new Error('Failed to create guild');
        return res.json();
    },
} as UseMutationOptions<any, Error, { guildName: string }>);