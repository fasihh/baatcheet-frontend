import { use } from "react";
import { Button } from "../../components/ui/button";
import { MessageCircle, MoreVertical, User } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getFriendsQuery } from "@/lib/queries/user";

export function FriendsList() {
  const { data } = useSuspenseQuery(getFriendsQuery());

  return (
    <div className="px-6">
      <div className="py-3">
        All Friends{" - "}{data.friends.length}
      </div>
      {data.friends.map((friend: any) => (
        <div
          key={friend.userId}
          className="flex justify-between items-center group hover:bg-muted transition-all border-t rounded p-2"
        >
          <div className="flex gap-4 items-center">
            <div className="flex justify-center items-center bg-accent group-hover:bg-background transition-all rounded-full h-10 w-10">
              <User />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span>{friend.name}</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">{friend.username}</span>
              </div>
              <span className="text-sm text-muted-foreground">TBA</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="hover:bg-background rounded-full">
              <MessageCircle />
            </Button>
            <Button size="icon" variant="ghost" className="hover:bg-background rounded-full">
              <MoreVertical />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}