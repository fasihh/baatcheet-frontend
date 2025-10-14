import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user';
import { cn } from '@/lib/utils';
import { getDirectMessagesQuery } from '@/queries/chats';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

const DirectMessagesList = () => {
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getDirectMessagesQuery(token!)
  });
  const navigate = useNavigate();
  const { chatId } = useParams();
  
  return (
    <ul className="px-2 space-y-2">
      {data.chats.map((dmObj: Record<string, any>) => (
        <Item
          key={dmObj.chatId}
          className={cn(
            'hover:bg-muted cursor-pointer',
            dmObj.chatId === chatId ? 'bg-muted' : ''
          )}
          variant="outline"
          role="listitem"
          onClick={() => navigate(`/chats/${dmObj.chatId}`)}
        >
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span>{dmObj.otherUsername}</span>
        </Item>
      ))}
    </ul>
  );
}

function ChatLayout() {
  return (
    <div className="flex h-screen">
      {/* Left Panel for Chats */}
      <Card className="min-w-[16rem] h-full flex flex-col">
        <div className="p-4 text-lg font-bold border-b">Friends</div>
        <ScrollArea className="flex-1">
          <Suspense fallback={<div>Loading...</div>}>
            <DirectMessagesList />
          </Suspense>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full">Add Chat</Button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-background border-b flex items-center px-4">
          <Input placeholder="Search..." className="w-full" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
