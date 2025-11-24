import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user';
import { getGuildByIdQuery, getGuildMembersQuery, getRolesByMemberId } from '@/queries/guilds';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { Item } from '@/components/ui/item';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const GuildMemberListItem: React.FC<{
  member: Record<string, any>,
  guildId: string,
  ownerId: string,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void
}> = ({
  member,
  guildId,
  ownerId,
  isOpen,
  onOpenChange
}) => {
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getRolesByMemberId(token!, guildId, member.userId)
  });

  return (
    <Popover
      key={member.userId}
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger asChild>
        <Item className="hover:bg-muted cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {member.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1">{member.username}</span>
          {member.userId === ownerId && (
            <Crown className="w-4 h-4 text-yellow-500" />
          )}
        </Item>
      </PopoverTrigger>
      <PopoverContent className="w-64" side="left">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Roles</h3>
          <div className="flex flex-wrap gap-2">
            {data.roles.map((role: any) => (
              <Badge key={role.roleId} variant="secondary">
                {role.roleName}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const GuildMembersList = ({ guildId }: { guildId: string }) => {
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getGuildMembersQuery(token!, guildId)
  });
  const { data: guildData } = useSuspenseQuery({
    ...getGuildByIdQuery(token!, guildId)
  });
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Members — {data.members.length}</h2>
      </div>
      <ScrollArea className="flex-1">
        <ul className="px-2 py-2 space-y-1">
          {data.members.map((member: Record<string, any>) => (
            <GuildMemberListItem
              key={member.userId}
              member={member}
              guildId={guildId}
              ownerId={guildData.ownerId}
              isOpen={openPopoverId === member.userId}
              onOpenChange={(open) => setOpenPopoverId(open ? member.userId : null)}
            />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

function GuildPage() {
  const { guildId } = useParams();

  if (!guildId) {
    return <div>Guild not found</div>;
  }

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
