/**
 * The awards chapter: a two-column grid of tiles, one per award, then the blurb.
 * A tile with no projections this week shows a note in place of the player.
 */
import { Reveal } from "@/components/reveal";
import { num } from "@/lib/format";
import { stagger } from "@/lib/motion";
import type { Award, HeadshotMap } from "@/lib/week-types";
import { Blurb, Chapter, Headshot, Label } from "./parts";

/* The tile is the reveal box, so the grid still stretches every tile in a row to one height. */
function Tile({ award, headshots, index }: { award: Award; headshots: HeadshotMap; index: number }) {
  return (
    <Reveal className="rounded-card bg-gry p-sp-3" delay={stagger(index)}>
      {/* The MVB title takes two lines at phone width. Every title keeps two lines, so names and numbers align across a row. */}
      <Label className="mb-sp-1 min-h-[calc(2em*var(--leading-tight))]">{award.title}</Label>
      {award.missing ? (
        <div className="mt-sp-1 text-meta text-mute tabular-nums">Projections unavailable this week</div>
      ) : (
        <>
          {/* The headshot has no background, so the cutout sits on the card grey. */}
          <Headshot playerId={award.player_id} headshots={headshots} className="mb-sp-2 block size-award rounded-full" />
          <div className="text-body leading-tight font-extrabold">{award.player}</div>
          <div className="mt-sp-1 text-stat leading-stat font-black tabular-nums">{num(award.points)}</div>
          <div className="mt-sp-1 text-meta text-mute tabular-nums">
            {award.projection !== null ? `proj ${num(award.projection)} · ${award.team}` : award.team}
          </div>
        </>
      )}
    </Reveal>
  );
}

export function Awards({ awards, headshots, blurb }: { awards: Award[]; headshots: HeadshotMap; blurb: string }) {
  return (
    <Chapter>
      <Label>Awards</Label>
      <div className="grid grid-cols-[1fr_1fr] gap-sp-2">
        {awards.map((award, i) => (
          <Tile key={award.title} award={award} headshots={headshots} index={i} />
        ))}
      </div>
      <Blurb className="mt-sp-3">{blurb}</Blurb>
    </Chapter>
  );
}
