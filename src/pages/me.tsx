import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type React from 'react';
import { useUser } from '@/contexts/user';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { getIncomingRequestsQuery } from '@/queries/friend-requests';
import { AddFriend } from '@/components/add-friend';
import { acceptFriendRequestMutation, removeFriendMutation, rejectFriendRequestMutation } from '@/queries/friend-requests';
import queryClient from '@/queries/cllient';
import { getFriends } from '@/queries/user';
import { RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/components/ui/item';

const Requests: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const { data: incomingData } = useSuspenseQuery({
    ...getIncomingRequestsQuery(token!),
  })
  const { data: friendsData } = useSuspenseQuery({
    ...getFriends(token!),
  });
  
  const acceptFriendMutation = useMutation({
    ...acceptFriendRequestMutation(token!),
    onSuccess: (_, { userId }) => {
      // 1. Optimistically remove from cache
      queryClient.setQueryData(['friendRequests', 'incoming'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          requests: old.requests.filter((req: any) => req.userId !== userId),
        };
      });

      // 2. Background refresh (no visible loading)
      queryClient.invalidateQueries({
        queryKey: ['friendRequests', 'incoming'],
        refetchType: 'active',
      });
      
      // 3. Invalidate friends list to show the new friend
      queryClient.invalidateQueries({
        queryKey: ['friends'],
        refetchType: 'active',
      });
    },
    onError: (error: Error) => {
      console.error("Failed to accept friend request:", error.message);
    }
  })

  const removeFriendMut = useMutation({
    ...removeFriendMutation(token!),
    onSuccess: (_, { userId }) => {
      // 1. Optimistically remove from cache
      queryClient.setQueryData(['friends'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          friends: old.friends.filter((f: any) => f.userId !== userId),
        };
      });

      // 2. Background refresh (no visible loading)
      queryClient.invalidateQueries({
        queryKey: ['friends'],
        refetchType: 'active',
      });
    },
    onError: (error: Error) => {
      console.error("Failed to remove friend:", error.message);
    }
  });

  const rejectFriendMutation = useMutation({
    ...rejectFriendRequestMutation(token!),
    onSuccess: (_, { userId }) => {
      // 1. Optimistically remove from cache
      queryClient.setQueryData(['friendRequests', 'incoming'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          requests: old.requests.filter((req: any) => req.userId !== userId),
        };
      });

      // 2. Background refresh (no visible loading)
      queryClient.invalidateQueries({
        queryKey: ['friendRequests', 'incoming'],
        refetchType: 'active',
      });
    },
    onError: (error: Error) => {
      console.error("Failed to reject friend request:", error.message);
    }
  });

  const handleRefetch = () => {
    queryClient.invalidateQueries({
      queryKey: ['friendRequests'],
      refetchType: 'active',
    });
    queryClient.invalidateQueries({
      queryKey: ['friends'],
      refetchType: 'active',
    });
  };

  return (
    <Tabs defaultValue="incoming" className="w-full p-4">
      <div className="flex items-center justify-between w-full gap-4">
        <TabsList className="!w-auto">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {/* Add a pressable AddFriend button beside the tabs */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefetch}>
            <RefreshCcw />
          </Button>
          <AddFriend />
        </div>
      </div>

      {/* incoming requests mapped from fetched data */}
      <TabsContent value="incoming" className="flex-1">
        <div className="p-2">
          {incomingData?.requests && incomingData.requests.length > 0 ? (
            <ul className="space-y-2">
              {incomingData.requests.map((req: any) => (
                <Item
                  key={req.userId}
                  variant="outline"
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{req.username}</div>
                    <div className="text-sm text-muted-foreground">{req.name} • {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => acceptFriendMutation.mutate({ userId: req.userId })}
                      disabled={acceptFriendMutation.isPending}
                    >
                      {acceptFriendMutation.isPending ? "Accepting..." : "Accept"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => rejectFriendMutation.mutate({ userId: req.userId })}
                      disabled={rejectFriendMutation.isPending}
                    >
                      {rejectFriendMutation.isPending ? "Declining..." : "Decline"}  
                    </Button>
                  </div>
                </Item>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">No incoming requests.</div>
          )}
        </div>
      </TabsContent>

      {/* All friends tab - replaced placeholders with actual friendsData */}
      <TabsContent value="all" className="flex-1">
        <div className="p-2">
          {friendsData?.friends && friendsData.friends.length > 0 ? (
            <ul className="space-y-2">
              {friendsData.friends.map((f: any) => (
                <Item
                  key={f.userId}
                  variant="outline"
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {f.name} <span className="text-sm text-muted-foreground">({f.username})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Friends since {new Date(f.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        navigate(`/chats/${f.chatId}`);
                      }}
                    >
                        Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeFriendMut.mutate({ userId: f.userId })}
                    >
                      Remove
                    </Button>
                  </div>
                </Item>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">No friends yet.</div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">End of all friends</div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function FriendRequestPage() {
  return <Requests />;
}