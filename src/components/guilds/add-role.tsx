import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { COLORS, PERMISSIONS } from '@/constants';
import { createRoleMutation } from '@/queries/guilds';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/contexts/user';

export const AddRoleDialog: React.FC<{ guildId: string }> = ({ guildId }) => {
  const { token } = useUser();
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [selectedColor, setSelectedColor] = useState('gray');
  const [colorOpen, setColorOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    can_message: true, // Default permission
  });
  const [error, setError] = useState<string | null>(null);

  const qc = useQueryClient();

  const createRole = useMutation({
    ...createRoleMutation(token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guilds', guildId, 'roles'] });
      toast.success('Role created successfully');
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  })

  const handlePermissionToggle = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }
    createRole.mutate({
      guildId,
      roleName: roleName.trim(),
      color: selectedColor,
      permissions: Object.keys(permissions).filter(key => permissions[key])
    });
  };

  const resetForm = () => {
    setRoleName('');
    setSelectedColor('gray');
    setPermissions({ can_message: true });
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Create a new role with custom permissions for your server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Moderator"
            />
          </div>

          <div className="space-y-2">
            <Label>Role Color</Label>
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={colorOpen}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: selectedColor }}
                    />
                    {COLORS.find((color) => color.value === selectedColor)?.label}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search color..." />
                  <CommandList>
                    <CommandEmpty>No color found.</CommandEmpty>
                    <CommandGroup>
                      {COLORS.map((color) => (
                        <CommandItem
                          key={color.value}
                          value={color.value}
                          onSelect={(currentValue) => {
                            setSelectedColor(currentValue);
                            setColorOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedColor === color.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-3">
              {PERMISSIONS.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between">
                  <Label htmlFor={perm.key} className="cursor-pointer">
                    {perm.label}
                  </Label>
                  <Switch
                    id={perm.key}
                    checked={permissions[perm.key] || false}
                    onCheckedChange={() => handlePermissionToggle(perm.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};