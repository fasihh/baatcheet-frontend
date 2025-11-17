import React, { useState, useEffect, useRef, type JSX } from 'react';
import { useUser } from '@/contexts/user';
import { useMutation } from '@tanstack/react-query';
import { sendFriendRequestMutation } from '@/queries/friend_requests';
import { findUserByName } from '@/queries/user';

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
    <>
      {/* Button-like trigger so it looks like a proper button in the header */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded border bg-transparent hover:bg-muted text-sm"
        aria-haspopup="dialog"
      >
        + Add Friend
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-background rounded shadow-lg p-4 ring-1 ring-border"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Add Friend</h3>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-sm px-2 py-1 rounded hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="af-username" className="block text-sm font-medium">Username</label>
              <input
                ref={inputRef}
                id="af-username"
                name="username"
                value={formState.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                className="w-full rounded px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary"
                aria-invalid={!!visibleError}
                aria-describedby={visibleError ? 'af-error' : undefined}
              />

              {visibleError && (
                <div id="af-error" role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2">
                  {visibleError}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  {/* show loading state if either fetch or send mutation is running */}
                  {(findUser.isPending || sendRequest.isPending) ? 'Processing…' : 'Enter username to send a friend request.'}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={sendRequest.isPending || findUser.isPending}
                    className="px-3 py-1 rounded border bg-primary text-white disabled:opacity-50"
                  >
                    {sendRequest.isPending ? 'Sending...' : 'Send Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-3 py-1 rounded border bg-transparent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}