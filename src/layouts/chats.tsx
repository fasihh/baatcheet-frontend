import { Card } from '@/components/ui/card';
import { FriendsChatPanel } from '@/components/friends/friends-chat-panel';
import ErrorBoundary from '@/components/error-boundary';
import { GuildsList } from '@/components/guilds/guilds-list';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GuildChatsPanel } from '@/components/guilds/guild-chats-panel';

function ChatLayout() {
  const location = useLocation();
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
        <GuildsList />
      </Suspense>

      <ErrorBoundary resetKeys={[location.pathname]}>
        {/* Middle panel: Friends / DMs or Guild Channels */}
        <Card className="min-w-[16rem] h-full flex flex-col">
          {isGuildRoute ? <GuildChatsPanel /> : <FriendsChatPanel />}
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </ErrorBoundary >
    </div >
  );
};

export default ChatLayout;
