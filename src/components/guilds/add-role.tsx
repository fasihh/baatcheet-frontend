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
import { PlusIcon, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { createRoleMutation, updateRoleMutation, deleteRoleMutation, getRolePermissionsQuery } from '@/queries/guilds';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/contexts/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AddRoleDialogProps {
  guildId: string;
  role?: RoleData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddRoleDialog: React.FC<AddRoleDialogProps> = ({
  guildId,
  role,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}) => {
  const { token } = useUser();
  const [internalOpen, setInternalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [selectedColor, setSelectedColor] = useState('gray');
  const [colorOpen, setColorOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    can_message: true, // Default permission
  });
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isEditMode = !!role;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { data: rolePermissions, isSuccess } = useQuery({
    ...getRolePermissionsQuery(token!, guildId, role?.roleId!),
    enabled: !!role
  });

  const qc = useQueryClient();

  // Load role data when in edit mode
  useEffect(() => {
    if (!!role && open && isSuccess) {
      setRoleName(role.roleName);
      setSelectedColor(role.color);
      const permissionsObj: Record<string, boolean> = {};
      rolePermissions.permissions.forEach((perm: any) => {
        permissionsObj[perm] = true;
      });
      setPermissions(permissionsObj);
    }
  }, [role, open, isSuccess]);

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
  });

  const updateRole = useMutation({
    ...updateRoleMutation(token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guilds', guildId, 'roles'] });
      toast.success('Role updated successfully');
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteRole = useMutation({
    ...deleteRoleMutation(token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guilds', guildId, 'roles'] });
      toast.success('Role deleted successfully');
      setDeleteDialogOpen(false);
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

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

    const permissionsList = Object.keys(permissions).filter(key => permissions[key]);

    if (isEditMode) {
      updateRole.mutate({
        guildId,
        roleId: role!.roleId,
        roleName: roleName.trim(),
        color: selectedColor,
        permissions: permissionsList
      });
    } else {
      createRole.mutate({
        guildId,
        roleName: roleName.trim(),
        color: selectedColor,
        permissions: permissionsList
      });
    }
  };

  const handleDelete = () => {
    if (role) {
      deleteRole.mutate({
        guildId,
        roleId: role.roleId
      });
    }
  };

  const resetForm = () => {
    setRoleName('');
    setSelectedColor('gray');
    setPermissions({ can_message: true });
    setError(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        {!isEditMode && (
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <PlusIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Role' : 'Create Role'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the role settings and permissions.'
                : 'Create a new role with custom permissions for your server.'}
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
                {PERMISSIONS.filter(perm => !perm.hide).map((perm) => (
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

            <DialogFooter className="gap-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="mr-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRole.isPending || updateRole.isPending}>
                {isEditMode ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              All members with this role will lose it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};