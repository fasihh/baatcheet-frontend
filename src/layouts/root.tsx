import { Card } from '@/components/ui/card';
import { FriendsChatPanel } from '@/components/friends/friends-chat-panel';
import ErrorBoundary from '@/components/error-boundary';
import { GuildsList } from '@/components/guilds/guilds-list';
import { Suspense } from 'react';
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import { GuildChatsPanel } from '@/components/guilds/guild-chats-panel';
import { GuildPermissionWrapper } from '@/components/guilds/guild-permission-wrapper';
import { UserProfile } from '@/components/user-profile';
import { useUser } from '@/contexts/user';

function RootLayout() {
  const location = useLocation();
  const { guildId } = useParams();
  const navigate = useNavigate();
  const { logout } = useUser();
  const isGuildRoute = !!guildId;

  const handleAuthFailure = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const content = (
    <>
      {/* Middle panel: Friends / DMs or Guild Channels */}
      <Card className="min-w-[16rem] h-full flex flex-col pb-0">
        {isGuildRoute ? <GuildChatsPanel /> : <FriendsChatPanel />}
        <UserProfile />
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen">
      <ErrorBoundary resetKeys={[location.pathname]} onAuthFailure={handleAuthFailure}>
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

        {guildId ? (
          <ErrorBoundary resetKeys={[location.pathname]} onAuthFailure={handleAuthFailure}>
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                Loading guild...
              </div>
            }>
              <GuildPermissionWrapper guildId={guildId}>
                {content}
              </GuildPermissionWrapper>
            </Suspense>
          </ErrorBoundary>
        ) : (
          content
        )}
      </ErrorBoundary>
    </div >
  );
};

export default RootLayout;
