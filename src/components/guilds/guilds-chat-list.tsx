import { useUser } from "@/contexts/user";
import { getGuildChatsQuery } from "@/queries/chats";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "../ui/item";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";

export const GuildChatsList = ({ guildId }: { guildId: string }) => {
	const { token } = useUser();
	const { data } = useSuspenseQuery({
		...getGuildChatsQuery(token!, guildId)
	});
	const navigate = useNavigate();
	const { chatId } = useParams();

	return (
		<ul className="px-2 space-y-0.5">
			{data.chats?.map((chat: Record<string, any>) => (
				<Item
					key={chat.chatId}
					className={cn(
						'hover:bg-muted cursor-pointer',
						chat.chatId === chatId ? 'bg-muted' : ''
					)}
					role="listitem"
					onClick={() => navigate(`/guilds/${guildId}/chats/${chat.chatId}`)}
				>
					<Hash className="w-4 h-4 text-muted-foreground" />
					<span>{chat.chatName}</span>
				</Item>
			))}
		</ul>
	);
}