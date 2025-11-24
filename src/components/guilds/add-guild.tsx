import React, { useEffect, useRef, useState, type JSX } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/user";
import { createGuildMutation } from "@/queries/guilds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      qc.invalidateQueries({ queryKey: ["guilds"], refetchType: "active" });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Create Server"
          aria-label="Create Server"
          className="w-11 h-11 rounded-xl flex items-center justify-center border hover:bg-muted transition text-sm"
        >
          +
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
          <DialogDescription>
            Enter a name for your new server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guild-name">Server name</Label>
            <Input
              id="guild-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter server name"
              aria-invalid={!!error}
              aria-describedby={error ? "create-guild-error" : undefined}
            />
          </div>

          {error && (
            <div id="create-guild-error" role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={createGuild.isPending}
            >
              {createGuild.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddGuild;