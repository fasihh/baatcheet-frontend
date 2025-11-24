import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { UserRoundPlusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { DirectMessagesList } from "./direct-messages-list";

export const FriendsChatPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div
        className={cn(
          'p-2 text-md font-semibold rounded-lg mx-4',
          'cursor-pointer select-none',
          location.pathname === '/me' ? 'bg-muted' : 'text-muted-foreground'
        )}
        onClick={() => navigate('/me')}
        role="button"
        aria-pressed={location.pathname === '/me'}
      >
        <UserRoundPlusIcon width={18} height={18} className="inline-block mx-2" />
        Friends
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <DirectMessagesList />
        </Suspense>
      </ScrollArea>
    </>
  )
}