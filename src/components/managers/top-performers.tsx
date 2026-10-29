/**
 * The Top Performers chapter of a manager page: up to five players by points scored while started for the team.
 * Each row shows the points total and, under it, the points per game started.
 */
import { Chapter, Label } from "@/components/week/parts";
import type { Manager } from "@/lib/manager-types";
import { count, metaLine, oneDecimal, PlayerRow, PlayerRows } from "./player-row";

export function TopPerformers({ manager }: { manager: Manager }) {
  return (
    <Chapter reveal id="top-performers">
      <Label heading>Top Performers</Label>
      <PlayerRows empty="No starts yet.">
        {manager.top_performers.map((performer) => (
          <PlayerRow
            key={performer.player_id}
            player={performer}
            meta={metaLine(performer, count(performer.games, "start"))}
            points={performer.points}
            under={`${oneDecimal(performer.per_game)} a game`}
          />
        ))}
      </PlayerRows>
    </Chapter>
  );
}
