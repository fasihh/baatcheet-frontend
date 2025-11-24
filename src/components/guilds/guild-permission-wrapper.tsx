import { useSuspenseQuery } from "@tanstack/react-query";
import { getGuildPermissionsQuery } from "@/queries/guilds";
import { useUser } from "@/contexts/user";
import { PermissionProvider } from "@/contexts/permissions";
import { useMemo } from "react";

export const GuildPermissionWrapper = ({ guildId, children }: { guildId: string, children: React.ReactNode }) => {
  const { token } = useUser();
  const permissionsQuery = useMemo(() => getGuildPermissionsQuery(token!, guildId), [token, guildId]);
  const { data } = useSuspenseQuery(permissionsQuery);

  return (
    <PermissionProvider data={data}>
      {children}
    </PermissionProvider>
  );
};
