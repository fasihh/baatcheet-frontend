import React, { useEffect, useRef, useState, type JSX } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/user";
import { createGuildMutation, joinGuildMutation } from "@/queries/guilds";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AddGuild(): JSX.Element {
  const { token } = useUser();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('join');
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const createGuild = useMutation({
    ...createGuildMutation(token!),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["guilds"], refetchType: "active" });
      setOpen(false);
      resetForm();
      navigate(`/guilds/${data.guildId}`);
      toast.success("Guild created successfully");
    },
    onError: (err: any) => {
      setError(err?.message ?? "Failed to create guild");
      toast.error(err?.message ?? "Failed to create guild");
    },
  });

  const joinGuild = useMutation({
    ...joinGuildMutation(token!),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["guilds"], refetchType: "active" });
      setOpen(false);
      resetForm();
      navigate(`/guilds/${data.guildId}`);
      toast.success("Guild joined successfully");
    },
    onError: (err: any) => {
      setError(err?.message ?? "Failed to join guild");
      toast.error(err?.message ?? "Failed to join guild");
    },
  });

  const resetForm = () => {
    setName("");
    setError(null);
    setMode('create');
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setError(null);
    } else {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(mode === 'create' ? "Guild name is required" : "Server ID is required");
      return;
    }

    if (mode === 'create') {
      createGuild.mutate({ guildName: name.trim() });
    } else {
      joinGuild.mutate({ guildId: name.trim() });
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'create' ? 'join' : 'create');
    setError(null);
    setName("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const isPending = createGuild.isPending || joinGuild.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Add Server"
          aria-label="Add Server"
          className="w-11 h-11 rounded-xl flex items-center justify-center border hover:bg-muted transition text-sm"
        >
          +
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? "Create Server" : "Join Server"}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? "Enter a name for your new server."
              : "Enter an invite ID to join an existing server."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guild-input">
              {mode === 'create' ? "Server name" : "Server ID"}
            </Label>
            <Input
              id="guild-input"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === 'create' ? "Enter server name" : "Enter server ID"}
              aria-invalid={!!error}
              aria-describedby={error ? "guild-error" : undefined}
            />
          </div>

          {error && (
            <div id="guild-error" role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2">
              {error}
            </div>
          )}

          <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={toggleMode}
              className="w-full sm:w-auto"
            >
              {mode === 'create' ? "Join a Server" : "Create a Server"}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending
                ? (mode === 'create' ? "Creating..." : "Joining...")
                : (mode === 'create' ? "Create" : "Join")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddGuild;