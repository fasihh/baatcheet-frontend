"use client";

import { SocketProvider } from "@/context/socket-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { getQueryClient } from "@/lib/query-client";
import { QueryClientProvider} from "@tanstack/react-query";
import React from "react";

export function Providers({ children }: React.PropsWithChildren) {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          {children}
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
