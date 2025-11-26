import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GuildChatsList } from "./guilds-chat-list";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronDownIcon, ClipboardIcon, LogOutIcon, TrashIcon, EditIcon, UserCogIcon, BanIcon } from "lucide-react";
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
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createGuildChatMutation } from "@/queries/chats";
import { useUser } from "@/contexts/user";
import { getGuildByIdQuery, leaveGuildMutation, deleteGuildMutation, updateGuildMutation, transferOwnershipMutation, getGuildMembersQuery } from "@/queries/guilds";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { BannedMembersList } from "./banned-members-list";

export const GuildChatsPanel = () => {
	const { guildId } = useParams();
	const navigate = useNavigate();
	const { permissions } = usePermissions();
	const { token, getTokenPayload } = useUser();
	const qc = useQueryClient();

	const [open, setOpen] = useState(false);
	const [channelName, setChannelName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [transferDialogOpen, setTransferDialogOpen] = useState(false);
	const [bannedMembersOpen, setBannedMembersOpen] = useState(false);
	const [newGuildName, setNewGuildName] = useState("");
	const [editError, setEditError] = useState<string | null>(null);
	const [selectedNewOwner, setSelectedNewOwner] = useState<string>("");
	const [memberSearchOpen, setMemberSearchOpen] = useState(false);

	const currentUserId = getTokenPayload()?.userId;
	const { data: guildData } = useSuspenseQuery({
		...getGuildByIdQuery(token!, guildId!)
	});

	// Fetch guild members for transfer ownership
	const { data: membersData } = useSuspenseQuery({
		...getGuildMembersQuery(token!, guildId!)
	});

	const isOwner = guildData.guild.ownerId === currentUserId;

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

	const leaveGuild = useMutation({
		...leaveGuildMutation(token!),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds'] });
			toast.success("Left the server successfully");
			navigate('/me');
		},
		onError: (err: any) => {
			toast.error(err?.message ?? "Failed to leave server");
		}
	});

	const deleteGuild = useMutation({
		...deleteGuildMutation(token!),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds'] });
			toast.success("Server deleted successfully");
			navigate('/me');
		},
		onError: (err: any) => {
			toast.error(err?.message ?? "Failed to delete server");
		}
	});

	const updateGuild = useMutation({
		...updateGuildMutation(token!),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds', guildId] });
			qc.invalidateQueries({ queryKey: ['guilds'] });
			toast.success("Server name updated successfully");
			setEditDialogOpen(false);
			setNewGuildName("");
			setEditError(null);
			setPopoverOpen(false);
		},
		onError: (err: any) => {
			setEditError(err?.message ?? "Failed to update server name");
		}
	});

	const transferOwnership = useMutation({
		...transferOwnershipMutation(token!),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['guilds', guildId] });
			qc.invalidateQueries({ queryKey: ['guilds'] });
			toast.success("Ownership transferred successfully");
			location.reload();
		},
		onError: (err: any) => {
			toast.error(err?.message ?? "Failed to transfer ownership");
		}
	});

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = channelName.trim();

		if (!trimmedName) {
			setError("Channel name is required");
			return;
		}

		// Check for spaces
		if (trimmedName.includes(' ')) {
			setError("Channel name cannot contain spaces");
			return;
		}

		// Check for invalid characters (only alphanumeric and hyphens allowed)
		if (!/^[a-zA-Z0-9-]+$/.test(trimmedName)) {
			setError("Channel name can only contain letters, numbers, and hyphens");
			return;
		}

		// Check if hyphen is at start or end
		if (trimmedName.startsWith('-') || trimmedName.endsWith('-')) {
			setError("Channel name cannot start or end with a hyphen");
			return;
		}

		createChannel.mutate({ chatName: trimmedName });
	};

	const handleCopyGuildId = async () => {
		if (guildId) {
			await navigator.clipboard.writeText(guildId);
			toast.success("Guild ID copied to clipboard");
			setPopoverOpen(false);
		}
	};

	const handleLeaveGuild = () => {
		if (guildId) {
			leaveGuild.mutate({ guildId });
			setLeaveDialogOpen(false);
			setPopoverOpen(false);
		}
	};

	const handleDeleteGuild = () => {
		if (guildId) {
			deleteGuild.mutate({ guildId });
			setDeleteDialogOpen(false);
			setPopoverOpen(false);
		}
	};

	const handleEditGuild = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newGuildName.trim()) {
			setEditError("Server name is required");
			return;
		}
		if (guildId) {
			updateGuild.mutate({ guildId, guildName: newGuildName.trim() });
		}
	};

	const handleTransferOwnership = () => {
		if (guildId && selectedNewOwner) {
			transferOwnership.mutate({ guildId, newOwnerId: selectedNewOwner });
			setTransferDialogOpen(false);
			setPopoverOpen(false);
		}
	};

	const canManageChannels = permissions.can_manage_channels?.allowed;
	const canBanMembers = permissions.can_ban_members?.allowed;

	// Filter out current owner from member list
	const availableMembers = membersData.members.filter((m: any) => m.userId !== currentUserId);

	return (
		<>
			{/* Guild Title Header */}
			<div className="p-4 border-b">
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<div
							className="group flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors"
						>
							<h1 className="font-bold text-lg flex-1">
								{guildData.guild.guildName || "Guild"}
							</h1>
							<ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
						</div>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-56 p-2">
						<div className="flex flex-col gap-1">
							<Button
								variant="ghost"
								className="justify-start gap-2 w-full"
								onClick={handleCopyGuildId}
							>
								<ClipboardIcon className="w-4 h-4" />
								Copy Invite ID
							</Button>

							{isOwner && (
								<>
									<Separator className="my-1" />

									<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												className="justify-start gap-2 w-full"
											>
												<EditIcon className="w-4 h-4" />
												Edit Server
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Edit Server</DialogTitle>
												<DialogDescription>
													Change the name of your server.
												</DialogDescription>
											</DialogHeader>
											<form onSubmit={handleEditGuild} className="space-y-4">
												<div className="space-y-2">
													<Label htmlFor="guild-name">Server Name</Label>
													<Input
														id="guild-name"
														value={newGuildName}
														onChange={(e) => setNewGuildName(e.target.value)}
														placeholder={guildData.guild.guildName}
													/>
												</div>
												{editError && (
													<div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
														{editError}
													</div>
												)}
												<DialogFooter>
													<Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
														Cancel
													</Button>
													<Button type="submit" disabled={updateGuild.isPending}>
														{updateGuild.isPending ? "Saving..." : "Save Changes"}
													</Button>
												</DialogFooter>
											</form>
										</DialogContent>
									</Dialog>
								</>
							)}

							{(isOwner || canBanMembers) && (
								<>
									<Separator className="my-1" />
									<Button
										variant="ghost"
										className="justify-start gap-2 w-full"
										onClick={() => {
											setBannedMembersOpen(true);
											setPopoverOpen(false);
										}}
									>
										<BanIcon className="w-4 h-4" />
										Banned Members
									</Button>
								</>
							)}

							<Separator className="my-1" />

							{!isOwner && (
								<Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
									<DialogTrigger asChild>
										<Button
											variant="ghost"
											className="justify-start gap-2 w-full text-orange-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
										>
											<LogOutIcon className="w-4 h-4" />
											Leave Server
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Leave Server</DialogTitle>
											<DialogDescription>
												Are you sure you want to leave "{guildData.guild.guildName}"?
											</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
												Cancel
											</Button>
											<Button
												variant="destructive"
												onClick={handleLeaveGuild}
												disabled={leaveGuild.isPending}
											>
												{leaveGuild.isPending ? "Leaving..." : "Leave Server"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							)}

							{isOwner && (
								<>
									<Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												className="justify-start gap-2 w-full text-orange-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
											>
												<UserCogIcon className="w-4 h-4" />
												Transfer Ownership
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Transfer Ownership</DialogTitle>
												<DialogDescription>
													Transfer ownership of "{guildData.guild.guildName}" to another member. This action cannot be undone.
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-4">
												<div className="space-y-2">
													<Label>Select New Owner</Label>
													<Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																role="combobox"
																className="w-full justify-between"
															>
																{selectedNewOwner
																	? availableMembers.find((m: any) => m.userId === selectedNewOwner)?.username
																	: "Select member..."}
																<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-full p-0">
															<Command>
																<CommandInput placeholder="Search members..." />
																<CommandList>
																	<CommandEmpty>No member found.</CommandEmpty>
																	<CommandGroup>
																		{availableMembers.map((member: any) => (
																			<CommandItem
																				key={member.userId}
																				value={member.username}
																				onSelect={() => {
																					setSelectedNewOwner(member.userId);
																					setMemberSearchOpen(false);
																				}}
																			>
																				{member.username}
																			</CommandItem>
																		))}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
												</div>
											</div>
											<DialogFooter>
												<Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
													Cancel
												</Button>
												<Button
													variant="destructive"
													onClick={handleTransferOwnership}
													disabled={!selectedNewOwner || transferOwnership.isPending}
												>
													{transferOwnership.isPending ? "Transferring..." : "Transfer Ownership"}
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>

									<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												className="justify-start gap-2 w-full text-destructive hover:text-destructive hover:bg-destructive/10"
											>
												<TrashIcon className="w-4 h-4" />
												Delete Server
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Delete Server</DialogTitle>
												<DialogDescription>
													Are you sure you want to delete "{guildData.guild.guildName}"? This action cannot be undone and all data will be permanently lost.
												</DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
													Cancel
												</Button>
												<Button
													variant="destructive"
													onClick={handleDeleteGuild}
													disabled={deleteGuild.isPending}
												>
													{deleteGuild.isPending ? "Deleting..." : "Delete Server"}
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</>
							)}
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Text Channels Header */}
			<div className="p-4 pt-0 border-b flex items-center justify-between">
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

			{canBanMembers && (
				<BannedMembersList
					guildId={guildId!}
					open={bannedMembersOpen}
					onOpenChange={setBannedMembersOpen}
				/>
			)}
		</>
	);
}