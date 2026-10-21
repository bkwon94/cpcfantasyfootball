/**
 * The game changer hero: a black chapter with the player cutout on a red glow, the name, and the points.
 * It ports the .stage rules of the source stylesheet; the two gradients live in globals.css.
 */
import { Reveal } from "@/components/reveal";
import { num } from "@/lib/format";
import { DURATION, HERO_DELAY } from "@/lib/motion";
import type { GameChanger as GameChangerData, HeadshotMap } from "@/lib/week-types";
import { Blurb, Chapter, Headshot, Label } from "./parts";

export function GameChanger({
  gameChanger,
  headshots,
  blurb,
}: {
  gameChanger: GameChangerData;
  headshots: HeadshotMap;
  blurb?: string;
}) {
  const line = gameChanger.award.line;
  return (
    <Chapter dark>
      {/* The stage spans the card edge to edge. The cutout bleeds off the right and bottom edges,
          so the player reads as part of the card and not as a separate image on top. */}
      <div className="stage relative -mx-gutter -mt-sp-5 mb-sp-4 grid overflow-hidden">
        {/* The hero shows in three steps on load: the glow, then the cutout, then the points. The name and the label
            do not move, so the reader can start to read at once. The glow is a backdrop, so it fades in with no rise.
            The chapter has no reveal of its own, so no hero part sits inside two reveals. */}
        <Reveal className="stage-glow" trigger="mount" rise={false} delay={HERO_DELAY.glow} duration={DURATION.hero} />
        {/* The name wraps inside 60 percent of the card, so a long name never runs under the face. */}
        <div className="relative z-3 max-w-[60%] px-gutter pt-sp-5 pb-sp-4 [grid-area:1/1]">
          <Label dark>Game Changer</Label>
          <div className="m-0 text-score leading-stat font-black tabular-nums">
            {line.name}
            <small className="mt-sp-1 mb-sp-2 block text-meta font-semibold text-on-dark-muted">
              {/* One string, so React writes one text node and the browser kerns the line as one run. */}
              {[line.position, line.nfl_team, gameChanger.team].filter(Boolean).join(" · ")}
            </small>
          </div>
          <Reveal
            className="m-0 text-hero leading-hero font-black tracking-grade text-red-lt tabular-nums"
            trigger="mount"
            delay={HERO_DELAY.points}
            duration={DURATION.hero}
          >
            {num(line.points)}
          </Reveal>
          {line.projection !== null && (
            <div className="mt-sp-1 text-meta font-semibold text-on-dark-muted">projected {num(line.projection)}</div>
          )}
        </div>
        {/* The reveal box takes the grid place of the cutout, so the cutout keeps its size and its bleed. */}
        <Reveal
          className="relative z-1 -mr-[28%] w-full self-end justify-self-end [grid-area:1/1]"
          trigger="mount"
          delay={HERO_DELAY.cutout}
          duration={DURATION.hero}
        >
          <Headshot playerId={line.player_id} headshots={headshots} className="block h-auto w-full" />
        </Reveal>
      </div>
      {blurb && <Blurb dark>{blurb}</Blurb>}
    </Chapter>
  );
}
