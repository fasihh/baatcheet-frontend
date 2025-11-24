import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/contexts/user';
import { getGuilds } from '@/queries/guilds';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import AddGuild from '@/components/guilds/add-guild';
import { Home } from 'lucide-react';

export const GuildsList = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const { data } = useSuspenseQuery({
    ...getGuilds(token!)
  });

  const { guildId } = useParams();

  const guilds: Array<any> = data ?? [];

  return (
    <div className="w-16 flex flex-col items-center gap-3 py-3 bg-muted/5 border-r">
      <Button
        size="icon-lg"
        variant={location.pathname === '/me' ? 'default' : 'outline'}
        onClick={() => location.pathname !== '/me' && navigate('/me')}
      >
        <Home />
      </Button>

      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-3 px-1">
        {guilds.length > 0 ? (
          guilds.map((g) => {
            const letter = (g.guildName && g.guildName[0]) ? String(g.guildName[0]).toUpperCase() : '?';
            const isSelectedGuild = guildId === g.guildId;
            return (
              <Button
                key={g.guildId}
                onClick={() => navigate(`/guilds/${g.guildId}`)}
                variant={isSelectedGuild ? "default" : "outline"}
                size="icon-lg"
                title={g.guildName}
                aria-label={`Open ${g.guildName}`}
              >
                {letter}
              </Button>
            );
          })
        ) : (
          <div className="text-xs text-muted-foreground px-2 text-center">No servers</div>
        )}
      </div>

      {/* Create server now opens a dialog implemented in AddGuild */}
      <AddGuild />
    </div>
  );
};