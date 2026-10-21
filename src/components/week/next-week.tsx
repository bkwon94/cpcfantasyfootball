/**
 * Next week: one grey card per game with both teams and their records, the Must Watch tag, and the blurb.
 * The week number comes from the page, so the label reads the week after the one on the page.
 */
import { cn } from "@/lib/utils";
import type { AvatarMap, NextGame, Team } from "@/lib/week-types";
import { avatarSrc, Blurb, Chapter, Label, Tag, Who } from "./parts";

/* One team per row. The name takes the free width and the record stays whole on the right,
   so a long name never pushes a record or the other team onto a new line. */
function Side({ team, avatars }: { team: Team; avatars: AvatarMap }) {
  return (
    <div className="flex min-w-0 items-center gap-sp-2">
      <Who src={avatarSrc(avatars, team.roster_id)} name={team.name} fill />
      <span className="flex-none font-semibold whitespace-nowrap text-mute tabular-nums">{`${team.wins}-${team.losses}`}</span>
    </div>
  );
}

function Game({ game, avatars, first }: { game: NextGame; avatars: AvatarMap; first: boolean }) {
  return (
    <div className={cn("rounded-card bg-gry p-sp-3", !first && "mt-sp-2")}>
      <div className="text-body leading-body font-extrabold">
        <Side team={game.a} avatars={avatars} />
        {/* The "vs" lines up under the names, past the avatar column. */}
        <div className="my-sp-1 pl-[calc(var(--spacing-avatar)+var(--spacing-sp-2))] text-meta leading-none font-semibold text-mute">
          vs
        </div>
        <Side team={game.b} avatars={avatars} />
      </div>
      {game.must_watch && (
        <div>
          <Tag className="mt-sp-2 ml-0">Must Watch</Tag>
        </div>
      )}
      {game.must_watch && game.reason && <div className="mt-sp-1 text-meta text-mute">{game.reason}</div>}
    </div>
  );
}

export function NextWeek({
  week,
  games,
  avatars,
  blurb,
}: {
  week: number;
  games: NextGame[];
  avatars: AvatarMap;
  blurb?: string;
}) {
  return (
    <Chapter>
      <Label>{`Next Week · Week ${week + 1}`}</Label>
      {games.map((game, i) => (
        <Game key={game.a.roster_id} game={game} avatars={avatars} first={i === 0} />
      ))}
      {blurb && <Blurb className="mt-sp-3">{blurb}</Blurb>}
    </Chapter>
  );
}
