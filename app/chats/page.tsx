import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { MessageCircle, MoreVertical, User } from "lucide-react";

export async function getFriends() {
  const session = await getSession();

  const res = await fetch(`${process.env.API_URL}/users/friends`, {
    headers: { Authorization: `Bearer ${session}` }
  });

  return await res.json();
}

export default async function ChatPage() {
  const data = await getFriends();

  return (
    <div className="bg-background flex flex-col w-full h-full">
      <div className="flex items-center justify-between h-12 border-b px-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">Friends</span>
          <span className="bg-accent align-baseline rounded-full h-1.5 w-1.5 mx-2" />
          <Button variant="ghost" size="sm">
            All Friends
          </Button>
          <Button variant="ghost" size="sm">
            Online
          </Button>
        </div>
        <Button>
          Add Friends
        </Button>
      </div>
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
    </div>
  );
}