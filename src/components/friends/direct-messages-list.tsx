import { useUser } from "@/contexts/user";
import { getDirectMessagesQuery } from "@/queries/chats";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "../ui/item";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";

export const DirectMessagesList = () => {
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getDirectMessagesQuery(token!)
  });
  const navigate = useNavigate();
  const { chatId } = useParams();

  return (
    <ul className="px-2 space-y-2">
      {data
        .chats
        .sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        .map((dmObj: Record<string, any>) => (
          <Item
            key={dmObj.chatId}
            className={cn(
              'hover:bg-muted cursor-pointer',
              dmObj.chatId === chatId ? 'bg-muted' : ''
            )}
            variant="outline"
            role="listitem"
            onClick={() => navigate(`/chats/${dmObj.chatId}`)}
          >
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span>{dmObj.otherUsername}</span>
          </Item>
        ))
      }
    </ul>
  );
}