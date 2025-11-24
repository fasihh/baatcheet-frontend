import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { GuildChatsList } from "./guilds-chat-list";

export const GuildChatsPanel = () => {
	const { guildId } = useParams();

	return (
		<>
			<div className="p-4 border-b">
				<h2 className="font-semibold">Text Channels</h2>
			</div>
			<ScrollArea className="flex-1">
				<Suspense fallback={<div className="p-4">Loading channels...</div>}>
					{guildId && <GuildChatsList guildId={guildId} />}
				</Suspense>
			</ScrollArea>
		</>
	)
}