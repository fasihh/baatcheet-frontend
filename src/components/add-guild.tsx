import React, { useEffect, useRef, useState, type JSX } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/user";
import { createGuildMutation } from "@/queries/guilds";

export function AddGuild(): JSX.Element {
  const { token } = useUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();

  const createGuild = useMutation({
    ...createGuildMutation(token!),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["guilds", "user"], refetchType: "active" });
        setOpen(false);
        setName("");
        setError(null);
      },
      onError: (err: any) => {
        setError(err?.message ?? "Failed to create guild");
      },
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Guild name is required");
      return;
    }
    createGuild.mutate({ guildName: name.trim() });
  };

  return (
    <>
      <button
        type="button"
        title="Create Server"
        aria-label="Create Server"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="w-11 h-11 rounded-xl flex items-center justify-center border hover:bg-muted transition text-sm"
      >
        +
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-background rounded shadow-lg p-4 ring-1 ring-border"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Create Server</h3>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-sm px-2 py-1 rounded hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="guild-name" className="block text-sm font-medium">
                Server name
              </label>
              <input
                id="guild-name"
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter server name"
                className="w-full rounded px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary"
                aria-invalid={!!error}
                aria-describedby={error ? "create-guild-error" : undefined}
              />

              {error && (
                <div id="create-guild-error" role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGuild.isPending}
                  className="px-3 py-1 rounded border bg-primary text-white disabled:opacity-50"
                >
                  {createGuild.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddGuild;