import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      }
    }
  });
}

let browserQueryClient: QueryClient | null = null;

export function getQueryClient() {
  if (isServer || !browserQueryClient)
    return makeQueryClient();

  return browserQueryClient;
}