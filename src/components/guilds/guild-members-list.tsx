import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user';
import { getGuildByIdQuery, getGuildMembersQuery, getRolesByMemberId, removeUserFromGuildMutation, getGuildRolesQuery, assignRoleToMemberMutation, removeRoleFromMemberMutation } from '@/queries/guilds';
import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Hammer, RefreshCcw, UserMinus, PlusIcon, Check } from 'lucide-react';
import { Item } from '@/components/ui/item';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { usePermissions } from '@/contexts/permissions';
import { toast } from 'sonner';
import { AddRoleDialog } from './add-role';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

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
    const { token, getTokenPayload } = useUser();
    const qc = useQueryClient();
    const { data } = useSuspenseQuery({
      ...getRolesByMemberId(token!, guildId, member.userId)
    });
    const user = getTokenPayload();

    // Fetch all available guild roles
    const { data: guildRolesData } = useSuspenseQuery({
      ...getGuildRolesQuery(token!, guildId)
    });

    const removeUserFromGuild = useMutation({
      ...removeUserFromGuildMutation(token!),
      onSuccess: () => {
        onOpenChange(false);
        qc.invalidateQueries({ queryKey: ['guilds', guildId, 'members'] });
        toast.success(`${member.username} has been removed from the guild`);
      },
      onError: (err: any) => {
        console.error(err);
        toast.error('Failed to remove user from guild');
      },
    });

    const assignRole = useMutation({
      ...assignRoleToMemberMutation(token!),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['guilds', guildId, 'members', member.userId, 'roles'] });
        // toast.success('Role assigned successfully');
      },
      onError: (err: any) => {
        console.error(err);
        toast.error('Failed to assign role');
      },
    });

    const removeRole = useMutation({
      ...removeRoleFromMemberMutation(token!),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['guilds', guildId, 'members', member.userId, 'roles'] });
        // toast.success('Role removed successfully');
      },
      onError: (err: any) => {
        console.error(err);
        toast.error('Failed to remove role');
      },
    });

    const { permissions } = usePermissions();

    const canKick = permissions.can_kick_members?.allowed;
    const canBan = permissions.can_ban_members?.allowed;
    const canManageRoles = permissions.can_manage_roles?.allowed;
    const isOwner = member.userId === ownerId;

    const [roleComboboxOpen, setRoleComboboxOpen] = useState(false);

    const handleKick = () => {
      removeUserFromGuild.mutate({ guildId, userId: member.userId });
    };

    const handleBan = () => {
      removeUserFromGuild.mutate({ guildId, userId: member.userId });
    };

    const handleToggleRole = (roleId: string, isAssigned: boolean) => {
      if (isAssigned) {
        removeRole.mutate({ guildId, userId: member.userId, roleId });
      } else {
        assignRole.mutate({ guildId, userId: member.userId, roleId });
      }
    };

    // Get member's current role IDs
    const memberRoleIds = data.roles.map((role: any) => role.roleId);
    // Filter out Owner and Member roles from the list
    const selectableRoles = guildRolesData.roles.filter((role: any) =>
      role.roleName !== "Owner" && role.roleName !== "Member"
    );

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
            {isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Owner</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Item>
        </PopoverTrigger>
        <PopoverContent className="w-64" side="left">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Roles</h3>
                {canManageRoles && (
                  <Popover open={roleComboboxOpen} onOpenChange={setRoleComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <PlusIcon className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" side="left">
                      <Command>
                        <CommandInput placeholder="Search roles..." />
                        <CommandList>
                          <CommandEmpty>No roles found.</CommandEmpty>
                          <CommandGroup>
                            {selectableRoles.map((role: any) => {
                              const isAssigned = memberRoleIds.includes(role.roleId);
                              return (
                                <CommandItem
                                  key={role.roleId}
                                  value={role.roleName}
                                  onSelect={() => handleToggleRole(role.roleId, isAssigned)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isAssigned ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: role.color }}
                                    />
                                    {role.roleName}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.roles.map((role: any) => (
                  <Badge className="pl-1" key={role.roleId} variant="secondary">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full text-center" style={{ backgroundColor: role.color }} />
                      {role.roleName}
                    </div>
                  </Badge>
                ))}
              </div>
            </div>

            {!isOwner && (canKick || canBan) && user!.userId !== member.userId && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Actions</h3>
                  <div className="flex flex-col gap-2">
                    {canKick && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2"
                        onClick={handleKick}
                        disabled={removeUserFromGuild.isPending}
                      >
                        <UserMinus className="w-4 h-4" />
                        {removeUserFromGuild.isPending ? 'Kicking...' : 'Kick Member'}
                      </Button>
                    )}
                    {canBan && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="justify-start gap-2"
                        onClick={handleBan}
                        disabled={removeUserFromGuild.isPending}
                      >
                        <Hammer className="w-4 h-4" />
                        {removeUserFromGuild.isPending ? 'Banning...' : 'Ban Member'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

export const GuildMembersList = ({ guildId }: { guildId: string }) => {
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getGuildMembersQuery(token!, guildId)
  });
  const { data: guildData } = useSuspenseQuery({
    ...getGuildByIdQuery(token!, guildId)
  });
  const { permissions } = usePermissions();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const canManageRoles = permissions.can_manage_roles?.allowed;

  const qc = useQueryClient();
  const refreshMembers = () => qc.invalidateQueries({ queryKey: ['guilds', guildId, 'members'] });

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Members — {data.members.length}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="justify-center gap-2"
            onClick={refreshMembers}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          {canManageRoles && <AddRoleDialog guildId={guildId} />}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <ul className="px-2 py-2 space-y-1">
          {data.members
            .sort((a: Record<string, any>, b: Record<string, any>) => {
              if (a.userId === guildData.guild.ownerId) return -1;
              if (b.userId === guildData.guild.ownerId) return 1;
              return a.username.localeCompare(b.username);
            })
            .map((member: Record<string, any>) => (
              <GuildMemberListItem
                key={member.userId}
                member={member}
                guildId={guildId}
                ownerId={guildData.guild.ownerId}
                isOpen={openPopoverId === member.userId}
                onOpenChange={(open) => setOpenPopoverId(open ? member.userId : null)}
              />
            ))
          }
        </ul>
      </ScrollArea>
    </div>
  );
};
