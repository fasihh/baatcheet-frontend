import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user';
import { cn } from '@/lib/utils';
import { getDirectMessagesQuery } from '@/queries/chats';
import { getGuilds } from '@/queries/guilds';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import AddGuild from '@/components/add-guild';

const ServersList = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getGuilds(token!)
  });

  const guilds: Array<any> = data ?? [];

  return (
    <div className="w-16 flex flex-col items-center gap-3 py-3 bg-muted/5 border-r">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary text-white text-sm font-semibold cursor-pointer"
        title="Home"
        onClick={() => navigate('/')}
        role="button"
      >
        B
      </div>

      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-3 px-1">
        {guilds.length > 0 ? (
          guilds.map((g) => {
            const letter = (g.guildName && g.guildName[0]) ? String(g.guildName[0]).toUpperCase() : '?';
            return (
              <button
                key={g.guildId}
                onClick={() => navigate(`/guilds/${g.guildId}`)}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-background border hover:ring-2 hover:ring-primary/30 transition"
                title={g.guildName}
                aria-label={`Open ${g.guildName}`}
              >
                <Avatar>
                  <AvatarFallback>{letter}</AvatarFallback>
                </Avatar>
              </button>
            );
          })
        ) : (
          <div className="text-xs text-muted-foreground px-2 text-center">No servers</div>
        )}
      </div>

      {/* Create server now opens a dialog implemented in AddGuild */}
      <AddGuild />
    </div>
  );
};

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
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Server/Guild column (Discord-style) */}
      <Suspense fallback={
        <div className="w-16 flex flex-col items-center gap-3 py-3 bg-muted/5 border-r">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary text-white text-sm font-semibold">B</div>
          <div className="flex-1 w-full flex flex-col items-center gap-3 px-1">
            <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse" />
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border">+</div>
        </div>
      }>
        <ServersList />
      </Suspense>

      {/* Middle panel: Friends / DMs */}
      <Card className="min-w-[16rem] h-full flex flex-col">
        <div
          className={cn(
            'p-4 text-lg font-bold border-b',
            'cursor-pointer select-none',
            location.pathname === '/friend-requests' ? 'bg-muted' : ''
          )}
          onClick={() => navigate('/friend-requests')}
          role="button"
          aria-pressed={location.pathname === '/friend-requests'}
        >
          Friends
        </div>
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
