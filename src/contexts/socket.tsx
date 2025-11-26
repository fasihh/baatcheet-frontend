import React, { useCallback, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useUser } from "./user";


interface IMessage {
  senderId: string;
  content: string;
  chatId?: string;
  senderName?: string;
  senderUsername?: string;
  messageId?: string;
  createdAt?: string;
}

interface SocketProviderProps {
  children?: React.ReactNode
}

interface ISocketContext {
  sendMessage: (chatId: string, message: string, guildId?: string) => any;
  getMessagesForChat: (chatId: string) => IMessage[];
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  clearMessagesForChat: (chatId: string) => void;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw Error("state is undefined");

  return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  // Messages organized by chatId: { chatId: [messages] }
  const [messagesByChatId, setMessagesByChatId] = useState<Record<string, IMessage[]>>({});
  const { getTokenPayload } = useUser();

  const sendMessage: ISocketContext['sendMessage'] = useCallback(
    async (chatId: string, message: string, guildId?: string) => {
      const { userId, token } = getTokenPayload();

      const url = !!guildId
        ? `${import.meta.env.VITE_SOCKET_URL}/api/messages?guildId=${guildId}`
        : `${import.meta.env.VITE_SOCKET_URL}/api/messages`;

      try {
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
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }, [getTokenPayload]);

  const getMessagesForChat = useCallback((chatId: string): IMessage[] => {
    return messagesByChatId[chatId] || [];
  }, [messagesByChatId]);

  const joinChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit("join:chat", JSON.stringify({ chatId, userId: getTokenPayload().userId }));
    }
  }, [socket]);

  const leaveChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit("leave:chat", chatId);
    }
  }, [socket]);

  const clearMessagesForChat = useCallback((chatId: string) => {
    setMessagesByChatId((prev) => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });
  }, []);

  const onMessageReceived = useCallback((data: string) => {
    const parsed = JSON.parse(data);
    const newMessage: IMessage = {
      senderId: parsed.senderId,
      content: parsed.message,
      chatId: parsed.chatId,
      senderName: parsed.senderName,
      senderUsername: parsed.senderUsername,
      messageId: parsed.messageId,
      createdAt: parsed.createdAt
    };

    setMessagesByChatId((prev) => ({
      ...prev,
      [parsed.chatId]: [...(prev[parsed.chatId] || []), newMessage]
    }));
  }, []);

  useEffect(() => {
    const _socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: false
    });

    _socket.on("message", onMessageReceived);

    _socket.on("connect", () => {
      console.log("Socket connected:", _socket.id);
    });

    _socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(_socket);

    return () => {
      _socket.off("message", onMessageReceived);
      _socket.disconnect();
    };
  }, [onMessageReceived]);

  return (
    <SocketContext.Provider value={{ sendMessage, getMessagesForChat, joinChat, leaveChat, clearMessagesForChat }}>
      {children}
    </SocketContext.Provider>
  );
}
