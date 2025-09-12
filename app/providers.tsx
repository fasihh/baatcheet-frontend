import { SocketProvider } from "@/context/socket-provider";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  )
}