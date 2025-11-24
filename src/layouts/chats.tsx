import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Item } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user';
import { cn } from '@/lib/utils';
import { getDirectMessagesQuery, getGuildChatsQuery } from '@/queries/chats';
import { getGuilds } from '@/queries/guilds';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import AddGuild from '@/components/add-guild';
import { Separator } from '@/components/ui/separator';
import { UserRoundPlusIcon, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/error-boundary';

const ServersList = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getGuilds(token!)
  });

  const guilds: Array<any> = data ?? [];

  return (
    <div className="w-16 flex flex-col items-center gap-3 py-3 bg-muted/5 border-r">
      <Button
        size="icon-lg"
        variant={location.pathname === '/me' ? 'default' : 'outline'}
        onClick={() => location.pathname !== '/me' && navigate('/me')}
      >
        B
      </Button>

      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-3 px-1">
        {guilds.length > 0 ? (
          guilds.map((g) => {
            const letter = (g.guildName && g.guildName[0]) ? String(g.guildName[0]).toUpperCase() : '?';
            return (
              <Button
                key={g.guildId}
                onClick={() => navigate(`/guilds/${g.guildId}`)}
                variant="outline"
                size="icon-lg"
                title={g.guildName}
                aria-label={`Open ${g.guildName}`}
              >
                <Avatar>
                  <AvatarFallback>{letter}</AvatarFallback>
                </Avatar>
              </Button>
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
      {data
        .chats
        .sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        .map((dmObj: Record<string, any>) => (
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
        ))
      }
    </ul>
  );
}

const GuildChatsList = ({ guildId }: { guildId: string }) => {
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getGuildChatsQuery(token!, guildId)
  });
  const navigate = useNavigate();
  const { chatId } = useParams();

  return (
    <ul className="px-2 space-y-0.5">
      {data.chats?.map((chat: Record<string, any>) => (
        <Item
          key={chat.chatId}
          className={cn(
            'hover:bg-muted cursor-pointer',
            chat.chatId === chatId ? 'bg-muted' : ''
          )}
          role="listitem"
          onClick={() => navigate(`/guilds/${guildId}/chats/${chat.chatId}`)}
        >
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span>{chat.chatName}</span>
        </Item>
      ))}
    </ul>
  );
}

function ChatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { guildId } = useParams();
  const isGuildRoute = location.pathname.startsWith('/guilds/');

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

      <ErrorBoundary resetKeys={[location.pathname]}>
        {/* Middle panel: Friends / DMs or Guild Channels */}
        <Card className="min-w-[16rem] h-full flex flex-col">
          {isGuildRoute ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Text Channels</h2>
              </div>
              <ScrollArea className="flex-1">
                <Suspense fallback={<div className="p-4">Loading channels...</div>}>
                  {guildId && <GuildChatsList guildId={guildId} />}
                </Suspense>
              </ScrollArea>
            </>
          ) : (
            <>
              <div
                className={cn(
                  'p-2 text-md font-semibold rounded-lg mx-4',
                  'cursor-pointer select-none',
                  location.pathname === '/me' ? 'bg-muted' : 'text-muted-foreground'
                )}
                onClick={() => navigate('/me')}
                role="button"
                aria-pressed={location.pathname === '/me'}
              >
                <UserRoundPlusIcon width={18} height={18} className="inline-block mx-2" />
                Friends
              </div>
              <Separator />
              <ScrollArea className="flex-1">
                <Suspense fallback={<div>Loading...</div>}>
                  <DirectMessagesList />
                </Suspense>
              </ScrollArea>
            </>
          )}
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default ChatLayout;
