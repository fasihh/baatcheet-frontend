import { UseSuspenseQueryOptions } from "@tanstack/react-query";

export function getFriendsQuery(): UseSuspenseQueryOptions<any> {
  return {
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("api/user/friends", { cache: 'no-cache' });
      return await res.json();
    },
  };
}
