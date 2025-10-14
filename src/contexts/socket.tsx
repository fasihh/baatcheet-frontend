import React, { useCallback, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useUser } from "./user";


interface IMessage {
  senderId: string;
  content: string;
}

interface SocketProviderProps {
  children?: React.ReactNode
}

interface ISocketContext {
  sendMessage: (chatId: string, message: string) => any;
  messages: IMessage[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw Error("state is undefined");

  return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { getTokenPayload } = useUser();

  const sendMessage: ISocketContext['sendMessage'] = useCallback((chatId, message) => {
    console.log("Send Message", message);
    if (socket) {
      socket.emit("event:message", {
        chatId,
        message,
        senderId: getTokenPayload().userId
      });
    }
  }, [socket]);

  const onMessageRec = useCallback((msg: string) => {
    console.log("From Server Msg Rec", msg);
    const { message, senderId } = JSON.parse(msg) as { message: string; senderId: string };
    setMessages(prev => [...prev, { content: message, senderId }]);
  }, []);

  useEffect(() => {
    const _socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
      transports: ['websocket'],
      autoConnect: true,
    });
    _socket.on('message', onMessageRec);

    setSocket(_socket);

    return () => {
      _socket.off("message", onMessageRec);
      _socket.disconnect();
      setSocket(undefined);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
}