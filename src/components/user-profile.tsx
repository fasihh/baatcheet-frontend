import { useUser } from '@/contexts/user';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const UserProfile = () => {
  const { getTokenPayload, logout } = useUser();
  const user = getTokenPayload();

  return (
    <div className="p-3 border-t mt-auto">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted transition-colors text-left">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Online
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 mb-2" side="top" align="start">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">
                  {user?.name || user?.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{user?.username}
                </div>
              </div>
            </div>
            <Button
              className="w-full justify-start gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}