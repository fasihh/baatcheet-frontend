import { useUser } from "@/contexts/user";
import { getGuildChatsQuery, deleteGuildChatMutation, updateGuildChatMutation } from "@/queries/chats";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "../ui/item";
import { cn } from "@/lib/utils";
import { Hash, Trash, Pencil } from "lucide-react";
import { usePermissions } from "@/contexts/permissions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";

export const GuildChatsList = ({ guildId }: { guildId: string }) => {
	const { token } = useUser();
	const { data } = useSuspenseQuery({
		...getGuildChatsQuery(token!, guildId)
	});
	const navigate = useNavigate();
	const { chatId } = useParams();
	const { permissions } = usePermissions();
	const qc = useQueryClient();
	const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingChatId, setEditingChatId] = useState<string | null>(null);
	const [editChannelName, setEditChannelName] = useState("");
	const [editError, setEditError] = useState<string | null>(null);

	const canManageChannels = permissions.can_manage_channels?.allowed;

	const deleteChat = useMutation({
		...deleteGuildChatMutation(token!, guildId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds', guildId, 'chats'] });
			if (chatId === deletingChatId) {
				navigate(`/guilds/${guildId}`);
			}
			setDeletingChatId(null);
		},
		onError: () => {
			setDeletingChatId(null);
		}
	});

	const updateChat = useMutation({
		...updateGuildChatMutation(token!, guildId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds', guildId, 'chats'] });
			qc.invalidateQueries({ queryKey: ['chat', editingChatId] });
			setEditDialogOpen(false);
			setEditingChatId(null);
			setEditChannelName("");
			setEditError(null);
		},
		onError: (err: any) => {
			setEditError(err?.message ?? "Failed to update channel");
		}
	});

	const handleEditClick = (chat: Record<string, any>, e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingChatId(chat.chatId);
		setEditChannelName(chat.name);
		setEditDialogOpen(true);
		setEditError(null);
	};

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editChannelName.trim()) {
			setEditError("Channel name is required");
			return;
		}
		if (editingChatId) {
			updateChat.mutate({ chatId: editingChatId, chatName: editChannelName.trim() });
		}
	};

	if (!data.chats || data.chats.length === 0) {
		return (
			<div className="p-4 text-center text-sm text-muted-foreground">
				No text channels yet.
			</div>
		);
	}

	return (
		<>
			<ul className="px-2 space-y-0.5">
				{data.chats?.map((chat: Record<string, any>) => (
					<Item
						key={chat.chatId}
						className={cn(
							'hover:bg-muted cursor-pointer group flex items-center justify-between pr-2',
							chat.chatId === chatId ? 'bg-muted' : ''
						)}
						role="listitem"
						onClick={() => navigate(`/guilds/${guildId}/chats/${chat.chatId}`)}
					>
						<div className="flex items-center gap-2 overflow-hidden flex-1">
							<Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
							<span className="truncate">{chat.name}</span>
						</div>
						{canManageChannels && (
							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<Button
									variant="outline"
									size="icon"
									className="cursor-pointer h-6 w-6 flex-shrink-0"
									onClick={(e: React.MouseEvent) => handleEditClick(chat, e)}
								>
									<Pencil className="w-3 h-3" />
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="cursor-pointer h-6 w-6 flex-shrink-0"
											onClick={(e: React.MouseEvent) => {
												e.stopPropagation();
												setDeletingChatId(chat.chatId);
											}}
										>
											<Trash className="w-3 h-3 text-destructive" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
										<AlertDialogHeader>
											<AlertDialogTitle>Delete Channel</AlertDialogTitle>
											<AlertDialogDescription>
												Are you sure you want to delete <span className="font-semibold">#{chat.name}</span>? This action cannot be undone and all messages will be lost.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel onClick={() => setDeletingChatId(null)}>
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction
												variant="destructive"
												onClick={(e: React.MouseEvent) => {
													e.stopPropagation();
													deleteChat.mutate(chat.chatId);
												}}
												disabled={deleteChat.isPending}
											>
												{deleteChat.isPending ? "Deleting..." : "Delete"}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</Item>
				))}
			</ul>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
					<DialogHeader>
						<DialogTitle>Edit Channel</DialogTitle>
						<DialogDescription>
							Change the name of this text channel.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-channel-name">Channel Name</Label>
							<Input
								id="edit-channel-name"
								value={editChannelName}
								onChange={(e) => setEditChannelName(e.target.value)}
								placeholder="channel-name"
							/>
						</div>
						{editError && (
							<div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
								{editError}
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateChat.isPending}>
								{updateChat.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}