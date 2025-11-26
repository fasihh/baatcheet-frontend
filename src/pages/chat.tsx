import React, { Suspense, useEffect, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SocketProvider, useSocket } from '@/contexts/socket';
import { useUser } from '@/contexts/user';
import { getChatByIdQuery, getMessagesByChatIdQuery } from '@/queries/chats';
import { useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const ChatRoom: React.FC = () => {
  const { guildId, chatId } = useParams();

  if (!chatId)
    return <Navigate to="/" />;

  const [text, setText] = React.useState('');
  const { getMessagesForChat, sendMessage, joinChat, leaveChat, clearMessagesForChat } = useSocket();
  const { token } = useUser();
  const { data: messagesData } = useSuspenseQuery(getMessagesByChatIdQuery(token!, chatId));
  const { data: chatData } = useSuspenseQuery(getChatByIdQuery(token!, chatId));
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    try {
      await sendMessage(chatId, text, guildId);
      setText('');
      scrollToBottom();
    } catch (error: any) {
      // Check if it's a toxic content error
      if (error?.error === 'TOXIC_CONTENT' || error?.message?.includes('toxic')) {
        toast.error(error?.message || 'Message contains toxic content and cannot be sent', {
          description: error?.toxicityScore 
            ? `Toxicity score: ${(error.toxicityScore * 100).toFixed(1)}%` 
            : undefined,
        });
      } else {
        // Generic error
        toast.error(error?.message || 'Failed to send message');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prevMessages = messagesData.messages || [];
  const socketMessages = getMessagesForChat(chatId);

  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
    }

    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId, joinChat, leaveChat]);

  useEffect(() => {
    clearMessagesForChat(chatId);
  }, [messagesData, chatId, clearMessagesForChat]);

  useEffect(() => {
    scrollToBottom();
  }, [prevMessages, socketMessages]);

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        {!!chatData.chat.name && <><h2 className="font-semibold">#{chatData.chat.name}</h2> <span className="text-muted-foreground">•</span></>}
        {chatData.chat.createdAt && <p className="text-xs text-muted-foreground">Created on {new Date(chatData.chat.createdAt).toLocaleString()}</p>}
      </div>
      {/* Scrollable Area */}
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...prevMessages, ...socketMessages].map((msg: Record<string, any>, index: number) => (
            <div
              key={index}
              className="flex gap-3 hover:bg-muted/50 -mx-4 px-4 py-1 group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  {msg.senderName?.[0]?.toUpperCase() || msg.senderUsername?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">
                    {msg.senderName || msg.senderUsername || 'Unknown User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.createdAt ? formatTimestamp(msg.createdAt) : 'Just now'}
                  </span>
                </div>
                <div className="text-sm mt-0.5 break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input Box */}
      <div className="p-4 border-t flex items-center space-x-2">
        <Input
          placeholder="Type a message..."
          className="flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <Button onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
};

function ChatPage() {
  return (
    <SocketProvider>
      <div className="flex flex-col h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <ChatRoom />
        </Suspense>
      </div>
    </SocketProvider>
  );
}

export default ChatPage;
