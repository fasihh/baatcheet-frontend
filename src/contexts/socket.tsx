import React, { useCallback, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useUser } from "./user";


interface IMessage {
  senderId: string;
  content: string;
  chatId?: string;
}

interface SocketProviderProps {
  children?: React.ReactNode
}

interface ISocketContext {
  sendMessage: (chatId: string, message: string, guildId?: string) => any;
  messages: IMessage[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw Error("state is undefined");

  return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [_socket_holder, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { getTokenPayload } = useUser();

  const sendMessage: ISocketContext['sendMessage'] = useCallback(
  async (chatId: string, message: string, guildId?: string) => {
    console.log("Send Message", message);

    const { userId, token } = getTokenPayload();

    const url = guildId
      ? `${import.meta.env.VITE_SOCKET_URL}/api/messages?guildId=${guildId}`
      : `${import.meta.env.VITE_SOCKET_URL}/api/messages`;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId,      
        senderId: userId,
        message
      })
    });
  },[]);

  const onMessageReceived = useCallback((data: string) => {
    const parsed = JSON.parse(data);
    setMessages((prev) => [
      ...prev,
      { senderId: parsed.senderId, content: parsed.message, chatId: parsed.chatId }
    ]);
  }, []);

  useEffect(() => {
    const _socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: false
    });

    _socket.on("message", onMessageReceived);
    setSocket(_socket);

    return () => {
      _socket.off("message", onMessageReceived);
      _socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
}