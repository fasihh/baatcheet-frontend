import { Card } from '@/components/ui/card';
import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { GuildMembersList } from '@/components/guilds/guild-members-list';

function GuildPage() {
  const { guildId } = useParams();

  if (!guildId)
    return <div>Guild not found</div>;

  return (
    <div className="flex h-full">
      {/* Middle panel: Chat room */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {/* Right panel: Members list */}
      <Card className="min-w-[16rem] h-full flex flex-col border-l">
        <Suspense fallback={<div className="p-4">Loading members...</div>}>
          <GuildMembersList guildId={guildId} />
        </Suspense>
      </Card>
    </div>
  );
}

export default GuildPage;
