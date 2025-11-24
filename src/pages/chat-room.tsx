import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SocketProvider, useSocket } from '@/contexts/socket';
import { useUser } from '@/contexts/user';
import { useQuery } from '@tanstack/react-query';
import { getMessagesByChatIdQuery } from '@/queries/chats';
import { Skeleton } from '@/components/ui/skeleton';

const ChatRoom: React.FC<{ chatId: string }> = ({ chatId }) => {
  const [text, setText] = React.useState('');
  const { messages, sendMessage } = useSocket();
  const { token, getTokenPayload } = useUser();
  const { data, isLoading } = useQuery(getMessagesByChatIdQuery(token!, chatId));
  const user = getTokenPayload();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim()) {
      sendMessage(chatId, text);
      setText('');
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prevMessages = data?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [prevMessages, messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Area */}
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {/* Skeleton Loading */}
          {isLoading && (
            Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="text-left">
                <Skeleton className="inline-block w-1/2 h-6 rounded-lg" />
              </div>
            ))
          )}

          {/* Messages */}
          {[...prevMessages, ...messages].map(({ content, senderId }: Record<string, any>, index: number) => (
            <div
              key={index}
              className={`${
                senderId === user.userId ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  senderId === user.userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {content}
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
        <Button
          onClick={() => {
            if (text.trim()) {
              sendMessage(chatId, text);
              setText('');
              scrollToBottom();
            }
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

function ChatPage() {
  const { chatId } = useParams();

  return (
    <SocketProvider>
      <div className="flex flex-col h-full">
        <ChatRoom chatId={chatId!} />
      </div>
    </SocketProvider>
  );
}

export default ChatPage;
