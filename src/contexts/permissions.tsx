import React, { createContext, useContext, useMemo } from 'react';
import { useUser } from './user';

type PermissionKey =
  | 'can_ban_members'
  | 'can_change_owner'
  | 'can_kick_members'
  | 'can_manage_channels'
  | 'can_manage_permissions'
  | 'can_manage_roles'
  | 'can_message'

interface PermissionContextType {
  permissions: Partial<Record<PermissionKey, { allowed: boolean, reason: string }>>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{
  data: Record<string, any>,
  children: React.ReactNode
}> = ({ data, children }) => {
  const { token } = useUser();

  const permissions = useMemo(() => {
    const permissions = data.permissions.map((permission: Record<string, any>) => [
      permission.permission, { allowed: permission.allowed, reason: permission.grantedByRole }
    ])

    return Object.fromEntries(permissions) as PermissionContextType['permissions'];
  }, [data, token]);

  return (
    <PermissionContext.Provider value={{ permissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};