import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user';
import { getGuildByIdQuery, getGuildMembersQuery, getRolesByMemberId, removeUserFromGuildMutation } from '@/queries/guilds';
import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Hammer, UserMinus, PlusIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Item } from '@/components/ui/item';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { usePermissions } from '@/contexts/permissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const COLORS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'orange', label: 'Orange' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'gray', label: 'Gray' },
  { value: 'white', label: 'White' },
];

const PERMISSIONS = [
  { key: 'can_manage_channels', label: 'Manage Channels' },
  { key: 'can_manage_roles', label: 'Manage Roles' },
  { key: 'can_manage_permissions', label: 'Manage Permissions' },
  { key: 'can_kick_members', label: 'Kick Members' },
  { key: 'can_ban_members', label: 'Ban Members' },
  { key: 'can_message', label: 'Send Messages' },
  { key: 'can_change_owner', label: 'Change Owner' },
];

const AddRoleDialog: React.FC<{ guildId: string }> = ({ guildId }) => {
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [selectedColor, setSelectedColor] = useState('gray');
  const [colorOpen, setColorOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    can_message: true, // Default permission
  });
  const [error, setError] = useState<string | null>(null);

  const handlePermissionToggle = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    // TODO: Implement create role mutation
    console.log({
      roleName: roleName.trim(),
      color: selectedColor,
      permissions
    });

    toast.success(`Role "${roleName}" created successfully`);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setRoleName('');
    setSelectedColor('gray');
    setPermissions({ can_message: true });
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Create a new role with custom permissions for your guild.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Moderator"
            />
          </div>

          <div className="space-y-2">
            <Label>Role Color</Label>
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={colorOpen}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: selectedColor }}
                    />
                    {COLORS.find((color) => color.value === selectedColor)?.label}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search color..." />
                  <CommandList>
                    <CommandEmpty>No color found.</CommandEmpty>
                    <CommandGroup>
                      {COLORS.map((color) => (
                        <CommandItem
                          key={color.value}
                          value={color.value}
                          onSelect={(currentValue) => {
                            setSelectedColor(currentValue);
                            setColorOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedColor === color.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-3">
              {PERMISSIONS.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between">
                  <Label htmlFor={perm.key} className="cursor-pointer">
                    {perm.label}
                  </Label>
                  <Switch
                    id={perm.key}
                    checked={permissions[perm.key] || false}
                    onCheckedChange={() => handlePermissionToggle(perm.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
    const qc = useQueryClient();
    const { data } = useSuspenseQuery({
      ...getRolesByMemberId(token!, guildId, member.userId)
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
    const { permissions } = usePermissions();

    const canKick = permissions.can_kick_members?.allowed;
    const canBan = permissions.can_ban_members?.allowed;
    const isOwner = member.userId === ownerId;

    const handleKick = () => {
      removeUserFromGuild.mutate({ guildId, userId: member.userId });
    };

    const handleBan = () => {
      removeUserFromGuild.mutate({ guildId, userId: member.userId });
    };

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
              <h3 className="font-semibold text-sm">Roles</h3>
              <div className="flex flex-wrap gap-2">
                {data.roles.map((role: any) => (
                  <Badge key={role.roleId} variant="secondary">
                    {role.roleName}
                  </Badge>
                ))}
              </div>
            </div>

            {!isOwner && (canKick || canBan) && (
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

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Members — {data.members.length}</h2>
        {canManageRoles && <AddRoleDialog guildId={guildId} />}
      </div>
      <ScrollArea className="flex-1">
        <ul className="px-2 py-2 space-y-1">
          {data.members
            .sort((a: Record<string, any>, b: Record<string, any>) => {
              if (a.userId === guildData.ownerId) return -1;
              if (b.userId === guildData.ownerId) return 1;
              return a.username.localeCompare(b.username);
            })
            .map((member: Record<string, any>) => (
              <GuildMemberListItem
                key={member.userId}
                member={member}
                guildId={guildId}
                ownerId={guildData.ownerId}
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
