/**
 * The trades chapter: one grey card per trade, with a column per side that lists what the side gets.
 * Two sides face each other across a red For tag; three or four sides wrap two per row with no tag.
 */
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { AvatarMap, Trade, TradeSide } from "@/lib/week-types";
import { Avatar, avatarSrc, Chapter, Label } from "./parts";

/* Each column spans three rows of the card grid: the team, the Gets label, and the chips.
   A long team name grows its row in both columns, so the chips start on one line. */
function Side({ side, avatars }: { side: TradeSide; avatars: AvatarMap }) {
  return (
    <div className="row-span-3 grid min-w-0 grid-rows-subgrid gap-y-0">
      <div className="flex flex-col items-center gap-sp-1 text-center text-meta leading-tight font-extrabold hyphens-auto">
        <Avatar src={avatarSrc(avatars, side.team.roster_id)} />
        <span>{side.team.name}</span>
      </div>
      <span className="mt-sp-2 mb-sp-1 justify-self-center text-label font-bold tracking-wide text-mute uppercase">
        Gets
      </span>
      <ul className="m-0 flex list-none flex-col gap-sp-2 p-0">
        {side.players.map((player) => (
          <li
            key={player.name}
            className="flex flex-col items-center overflow-hidden rounded-card bg-wht px-sp-2 pt-sp-2 pb-sp-3 text-center"
          >
            {/* The cutout fills the chip top edge to edge, so the chip reads as a card for that player.
                The red rule matches the page accent. The gradient is plain sRGB, as the stylesheet draws it. */}
            <img
              src={player.headshot}
              alt=""
              loading="lazy"
              className="-mx-sp-2 -mt-sp-2 mb-sp-2 block h-headshot w-[calc(100%+var(--spacing-sp-2)*2)] flex-none border-b-2 border-red bg-[linear-gradient(var(--color-gry),var(--color-wht))] object-contain object-bottom"
            />
            <b className="text-row leading-tight font-extrabold tracking-snug">{player.name}</b>
          </li>
        ))}
        {side.picks.map((pick, i) => (
          <li key={i} className="py-sp-1 text-center text-meta text-mute">
            {pick}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The divider runs the full card height between the two columns. The tag sits on it, level with the team names. */
function For() {
  return (
    <div className="relative row-span-3 flex flex-col items-center before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-bar-off">
      <span className="relative mt-sp-5 rounded-sm bg-red p-sp-1 text-label font-extrabold tracking-caps text-on-dark uppercase">
        For
      </span>
    </div>
  );
}

function TradeCard({ trade, avatars, first }: { trade: Trade; avatars: AvatarMap; first: boolean }) {
  // Three or four sides have no single other side, so only a pair gets the For tag.
  const pair = trade.sides.length === 2;
  return (
    <div className={cn("rounded-card bg-gry p-sp-3", !first && "mt-sp-2")}>
      <div
        className={cn(
          "grid gap-x-sp-2 gap-y-sp-4",
          pair ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        {trade.sides.map((side, i) => (
          <Fragment key={side.team.roster_id}>
            {pair && i === 1 && <For />}
            <Side side={side} avatars={avatars} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* A week with no trades has no trades chapter, as the old page did. */
export function Trades({ trades, avatars }: { trades: Trade[]; avatars: AvatarMap }) {
  if (trades.length === 0) return null;
  return (
    <Chapter id="trades">
      <Label>Trades</Label>
      {trades.map((trade, i) => (
        <TradeCard key={i} trade={trade} avatars={avatars} first={i === 0} />
      ))}
    </Chapter>
  );
}
