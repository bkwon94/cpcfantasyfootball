/**
 * The Moves chapter of a manager page: the season totals of adds, drops, and trades, then the moves of each week.
 * The weeks come newest first, in the order of the managers file. A week with no moves reads one quiet line.
 */
import { Chapter, Label } from "@/components/week/parts";
import type { Manager, ManagerPlayer, MoveAdd, MoveTrade, MoveWeek } from "@/lib/manager-types";
import { cn } from "@/lib/utils";
import { MoveHeadshot } from "./move-headshot";

/* The quiet label of a group: small, uppercase, and mute, as the Gets label of the week page trade card. */
const QUIET_LABEL = "text-label leading-tight font-bold tracking-wide text-mute uppercase";

/* The position, then the detail. The players file can lack a player, so a null position drops out of the line. */
function metaLine(position: string | null, detail: string) {
  return position ? `${position} · ${detail}` : detail;
}

/* A free agent pickup has no bid. A waiver claim with no saved bid reads as a plain waiver claim. */
function addDetail(add: MoveAdd) {
  if (add.kind === "free_agent") return "Free agent";
  return add.bid === null ? "Waiver" : `$${add.bid} bid`;
}

/* One player row: the headshot, the name as the one emphasis, and one quiet line under it. */
function PlayerRow({ player, detail }: { player: ManagerPlayer; detail: string }) {
  return (
    <li className="flex items-center gap-sp-2">
      <MoveHeadshot playerId={player.player_id} />
      <span className="flex min-w-0 flex-col">
        <b className="text-row leading-tight font-extrabold tracking-snug">{player.name}</b>
        <span className="text-meta text-mute">{metaLine(player.position, detail)}</span>
      </span>
    </li>
  );
}

/* One side of a trade: the quiet label, then the players with their positions. */
function TradeSide({ label, players }: { label: string; players: ManagerPlayer[] }) {
  return (
    <div className="min-w-0">
      <div className={cn(QUIET_LABEL, "mb-sp-2")}>{label}</div>
      <ul aria-label={label} className="m-0 flex list-none flex-col gap-sp-2 p-0">
        {players.map((player) => (
          <PlayerRow key={player.player_id} player={player} detail={player.position ?? ""} />
        ))}
      </ul>
    </div>
  );
}

/* A trade as a grey card with both sides, as the week page trade card sets it.
   The file carries the roster ids of the other sides and not their names, so the card counts the teams. */
function TradeRow({ trade }: { trade: MoveTrade }) {
  const label = `Trade with ${trade.with.length} ${trade.with.length === 1 ? "team" : "teams"}`;
  return (
    <li>
      <div role="group" aria-label={label} className="rounded-card bg-gry p-sp-3">
        <div className={cn(QUIET_LABEL, "mb-sp-3")}>{label}</div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-sp-3">
          <TradeSide label="Gave" players={trade.gave} />
          <TradeSide label="Got" players={trade.got} />
        </div>
      </div>
    </li>
  );
}

/* One week: the quiet label, then the adds, the drops, and the trades in that order. */
function Week({ week, first }: { week: MoveWeek; first: boolean }) {
  const label = `Week ${week.week}`;
  const empty = week.adds.length + week.drops.length + week.trades.length === 0;
  return (
    <div role="group" aria-label={label} className={cn(!first && "mt-sp-6")}>
      <div className={cn(QUIET_LABEL, "mb-sp-2")}>{label}</div>
      {empty ? (
        <p className="m-0 text-body text-mute">No moves.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-sp-3 p-0">
          {week.adds.map((add) => (
            <PlayerRow key={`add-${add.player_id}`} player={add} detail={addDetail(add)} />
          ))}
          {week.drops.map((drop) => (
            <PlayerRow key={`drop-${drop.player_id}`} player={drop} detail="Dropped" />
          ))}
          {week.trades.map((trade, i) => (
            <TradeRow key={`trade-${i}`} trade={trade} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* The three season totals in one row. The count is the emphasis, and a zero count takes the quiet color. */
function Totals({ adds, drops, trades }: { adds: number; drops: number; trades: number }) {
  const totals: [string, number][] = [
    ["Adds", adds],
    ["Drops", drops],
    ["Trades", trades],
  ];
  return (
    <dl role="group" aria-label="Move Totals" className="m-0 mb-sp-6 grid grid-cols-3 gap-sp-3">
      {totals.map(([label, count]) => (
        <div key={label} className="flex flex-col">
          <dt className={QUIET_LABEL}>{label}</dt>
          <dd className={cn("m-0 mt-sp-1 text-stat leading-tight font-extrabold tabular-nums", count === 0 ? "text-mute" : "text-ink")}>
            {count}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* The chapter stays whole, so a long season lists every week with no collapse. */
export function Moves({ manager }: { manager: Manager }) {
  const { moves } = manager;
  return (
    <Chapter reveal id="moves">
      <Label heading>Moves</Label>
      <Totals adds={moves.adds} drops={moves.drops} trades={moves.trades} />
      {moves.weeks.map((week, i) => (
        <Week key={week.week} week={week} first={i === 0} />
      ))}
    </Chapter>
  );
}
