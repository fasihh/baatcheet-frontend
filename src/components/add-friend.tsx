import React, { useState, useEffect, useRef, type JSX } from 'react';
import { useUser } from '@/contexts/user';
import { useMutation } from '@tanstack/react-query';
import { sendFriendRequestMutation } from '@/queries/friend-requests';
import { findUserByName } from '@/queries/user';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

type FormState = {
  username: string;
  errors: string | null;
};

export function AddFriend(): JSX.Element {
  const { token } = useUser();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ username: "", errors: null });
  const findUser = useMutation(findUserByName(token!));
  const sendRequest = useMutation(sendFriendRequestMutation(token!));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      // focus the input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 0);
      // clear previous errors when reopened
      setFormState({ username: "", errors: null });
      findUser.reset?.();
      sendRequest.reset?.();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, username: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, errors: null }));

    try {
      const data = await findUser.mutateAsync(formState.username);

      const user = data.user;
      if (!user) {
        throw new Error("User not found");
      }

      await sendRequest.mutateAsync({ userId: user.userId });
      setOpen(false);
    } catch (error: any) {
      // prefer specific mutation errors, fall back to generic message
      const msg =
        (sendRequest.error as any)?.message ||
        (findUser.error as any)?.message ||
        error?.message ||
        "User not found";
      setFormState((prev) => ({ ...prev, errors: msg }));
    }
  }

  // Combined visible error (mutation or local)
  const visibleError =
    formState.errors ||
    (findUser.isError ? ((findUser.error as any)?.message ?? 'Failed to find user') : null) ||
    (sendRequest.isError ? ((sendRequest.error as any)?.message ?? 'Failed to send request') : null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          + Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Enter username to send a friend request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="af-username">Username</Label>
            <Input
              ref={inputRef}
              id="af-username"
              name="username"
              value={formState.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              aria-invalid={!!visibleError}
              aria-describedby={visibleError ? 'af-error' : undefined}
            />
          </div>

          {visibleError && (
            <div id="af-error" role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2">
              {visibleError}
            </div>
          )}

          {(findUser.isPending || sendRequest.isPending) && (
            <div className="text-sm text-muted-foreground">Processing…</div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={sendRequest.isPending || findUser.isPending}
            >
              {sendRequest.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}