import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense, useState } from "react";
import { useParams } from "react-router-dom";
import { GuildChatsList } from "./guilds-chat-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { usePermissions } from "@/contexts/permissions";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGuildChatMutation } from "@/queries/chats";
import { useUser } from "@/contexts/user";

export const GuildChatsPanel = () => {
	const { guildId } = useParams();
	const { permissions } = usePermissions();
	const { token } = useUser();
	const qc = useQueryClient();

	const [open, setOpen] = useState(false);
	const [channelName, setChannelName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const createChannel = useMutation({
		...createGuildChatMutation(token!, guildId!),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds', guildId, 'chats'] });
			setOpen(false);
			setChannelName("");
			setError(null);
		},
		onError: (err: any) => {
			setError(err?.message ?? "Failed to create channel");
		}
	});

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!channelName.trim()) {
			setError("Channel name is required");
			return;
		}
		createChannel.mutate({ chatName: channelName.trim() });
	};

	const canManageChannels = permissions.can_manage_channels?.allowed;

	return (
		<>
			<div className="p-4 border-b flex items-center justify-between">
				<h2 className="font-semibold">Text Channels</h2>
				{canManageChannels && (
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button size="icon-lg" variant="outline">
								<PlusIcon width={18} height={18} className="inline-block mx-2" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Text Channel</DialogTitle>
								<DialogDescription>
									Create a new text channel for this server.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleCreate} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="channel-name">Channel Name</Label>
									<Input
										id="channel-name"
										value={channelName}
										onChange={(e) => setChannelName(e.target.value)}
										placeholder="new-channel"
									/>
								</div>
								{error && (
									<div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
										{error}
									</div>
								)}
								<DialogFooter>
									<Button type="submit" disabled={createChannel.isPending}>
										{createChannel.isPending ? "Creating..." : "Create Channel"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				)}
			</div>
			<ScrollArea className="flex-1">
				<Suspense fallback={<div className="p-4">Loading channels...</div>}>
					{guildId && <GuildChatsList guildId={guildId} />}
				</Suspense>
			</ScrollArea>
		</>
	);
}