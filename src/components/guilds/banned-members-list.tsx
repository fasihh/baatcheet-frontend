import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getAllBansQuery, unbanUserFromGuildMutation } from "@/queries/guilds";
import { useUser } from "@/contexts/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface BannedMembersListProps {
  guildId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannedMembersList = ({ guildId, open, onOpenChange }: BannedMembersListProps) => {
  const { token } = useUser();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bannedMembers } = useSuspenseQuery({
    ...getAllBansQuery(token!, guildId),
  });

  const unbanUser = useMutation({
    ...unbanUserFromGuildMutation(token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guilds', guildId, 'bans'] });
      qc.invalidateQueries({ queryKey: ['guilds', guildId, 'members'] });
      toast.success("User unbanned successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to unban user");
    },
  });

  const handleUnban = (userId: string) => {
    unbanUser.mutate({ guildId, userId });
  };

  const filteredBans = bannedMembers.bans.filter((ban: any) => {
    return ban.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-lg">
        <DialogHeader>
          <DialogTitle>Banned Members</DialogTitle>
          <DialogDescription>
            View and manage banned members for this server.
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search banned members..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No banned members found.</CommandEmpty>
            <CommandGroup heading="Banned Users">
              {filteredBans.map((ban: any) => (
                <CommandItem
                  key={ban.userId}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {ban.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{ban.username}</span>
                      <span className="text-xs text-muted-foreground">
                        Banned: {new Date(ban.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnban(ban.userId)}
                    disabled={unbanUser.isPending}
                  >
                    {unbanUser.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Revoke Ban"
                    )}
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
