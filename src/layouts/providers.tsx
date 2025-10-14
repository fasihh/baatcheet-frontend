import { UserProvider } from "@/contexts/user";
import queryClient from "@/queries/cllient";
import { QueryClientProvider } from "@tanstack/react-query";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {children}
      </UserProvider>
    </QueryClientProvider>
  );
}

export default Providers;
