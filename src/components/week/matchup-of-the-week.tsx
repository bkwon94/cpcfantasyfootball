/**
 * The matchup of the week: the label with the reason tag, the score row with both teams, and the blurb.
 * It ports the #motw chapter of the Jinja week page.
 */
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AvatarMap, MatchupSide, Pick } from "@/lib/week-types";
import { Avatar, avatarSrc, Blurb, Chapter, Label, Tag } from "./parts";

/* A flex item cannot shrink below its longest word by default, so min-w-0 and hyphens keep a long team name inside a phone. */
function TeamCell({ side, avatars, right }: { side: MatchupSide; avatars: AvatarMap; right?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-[36%] min-w-0 items-center gap-sp-2 text-lead leading-tight font-extrabold hyphens-auto",
        right && "flex-row-reverse text-right",
      )}
    >
      <Avatar src={avatarSrc(avatars, side.team.roster_id)} />
      <span className="min-w-0">{side.team.name}</span>
    </div>
  );
}

function Points({ side }: { side: MatchupSide }) {
  return (
    <span className={cn("text-score leading-stat font-black whitespace-nowrap tabular-nums", side.loser && "text-red")}>
      {num(side.score)}
    </span>
  );
}

export function MatchupOfTheWeek({ pick, avatars, blurb }: { pick: Pick; avatars: AvatarMap; blurb: string }) {
  const [first, second] = pick.sides;
  return (
    <Chapter id="motw">
      <Label>
        Matchup of the Week <Tag>{pick.reason}</Tag>
      </Label>
      <div className="mb-sp-3 flex items-center justify-between gap-sp-2">
        <TeamCell side={first} avatars={avatars} />
        {/* Flex centers the small dash on the big numbers. Inline text would sit it on the baseline. */}
        <div className="flex items-center gap-sp-1 whitespace-nowrap">
          <Points side={first} />
          <span className="text-meta text-mute">–</span>
          <Points side={second} />
        </div>
        <TeamCell side={second} avatars={avatars} right />
      </div>
      <Blurb>{blurb}</Blurb>
    </Chapter>
  );
}
