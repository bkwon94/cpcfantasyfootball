/**
 * All matchups: one row per game with both teams and scores, and a button that opens the recap panel.
 * It is the one client component of the week page, because the recap button holds open state.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { num, shortName } from "@/lib/format";
import { DURATION, EASE_OUT, INSTANT, useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { AvatarMap, Matchup, MatchupSide } from "@/lib/week-types";
import { Avatar, avatarSrc, Blurb, Chapter, Label } from "./parts";

/* The top scorer of one side, or a dash when the side started no one. */
function Star({ side }: { side: MatchupSide }) {
  return (
    <div className="flex-1 rounded-card bg-gry px-sp-3 py-sp-2">
      <span className="block text-label leading-tight tracking-caps text-mute uppercase">{`Top · ${side.team.name}`}</span>
      <b className="mt-sp-0 block text-body leading-tight tabular-nums">
        {side.top ? `${shortName(side.top.name)} ${num(side.top.points)}` : "—"}
      </b>
    </div>
  );
}

function Panel({ matchup }: { matchup: Matchup }) {
  return (
    <div className="pb-sp-3">
      <div className="mb-sp-2 flex gap-sp-2">
        {matchup.sides.map((side) => (
          <Star key={side.team.roster_id} side={side} />
        ))}
      </div>
      {matchup.is_pick ? (
        <Blurb>
          This is the Matchup of the Week. Read the full story at the top.{" "}
          {/* An inline link cannot scale, so the link is an inline block for the press. */}
          <a href="#motw" className="press inline-block text-red underline hover:decoration-2">
            Go to the top story
          </a>
        </Blurb>
      ) : (
        <Blurb>{matchup.recap}</Blurb>
      )}
    </div>
  );
}

function Row({ matchup, avatars, first }: { matchup: Matchup; avatars: AvatarMap; first: boolean }) {
  const [open, setOpen] = useState(false);
  const off = useMotionOff();
  const panelId = useId();
  // The JSON puts the winner first. A tie has no winner, so neither side is bold.
  const [w, l] = matchup.sides;
  const bold = cn(w.winner && "font-extrabold text-red");
  const panel = open && (
    // The panel animates height, an exception to the transform and opacity rule. The panel is short and opens
    // on a tap only, and a FLIP of the rows below would move every other matchup.
    <motion.div
      key="panel"
      id={panelId}
      initial={off ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={off ? INSTANT : { duration: DURATION.collapse, ease: EASE_OUT }}
      className="overflow-hidden"
    >
      <Panel matchup={matchup} />
    </motion.div>
  );
  return (
    <div className="border-b border-rule last:border-b-0">
      {/* minmax(0,1fr) keeps both columns equal, even when one name has a long word.
          The chapter label already gives the first row its top space. */}
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-sp-2 pb-sp-2 tabular-nums",
          first ? "pt-0" : "pt-sp-3",
        )}
      >
        <div className="flex min-w-0 items-center gap-sp-2 text-row leading-tight font-semibold hyphens-auto">
          <Avatar src={avatarSrc(avatars, w.team.roster_id)} />
          <span>
            <span className={bold}>{w.team.name}</span> <span className={bold}>{num(w.score)}</span>
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-sp-2 text-right text-row leading-tight font-semibold hyphens-auto">
          {/* One string, so React writes one text node, as the old page did. */}
          <span>{`${num(l.score)} ${l.team.name}`}</span>
          <Avatar src={avatarSrc(avatars, l.team.roster_id)} />
        </div>
      </div>
      {/* 44px is the smallest comfortable touch target. The color change on open is instant, so only the press animates. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
        className={cn(
          "press mb-sp-3 flex min-h-touch w-full cursor-pointer items-center justify-center gap-sp-2 rounded-card border-0 px-sp-3",
          "text-meta font-bold tracking-caps uppercase [-webkit-tap-highlight-color:transparent]",
          open ? "bg-blk text-on-dark" : "bg-gry text-red hover:bg-rule",
        )}
      >
        <span>{open ? "Hide recap" : "Read recap"}</span>
        {/* A turned square sits low in the line, so a small lift centers it on the text. */}
        <span
          aria-hidden
          className={cn(
            "inline-block size-chev border-r-2 border-b-2 border-current transition-[translate,rotate] duration-200 ease-out",
            open ? "translate-y-px -rotate-135" : "-translate-y-sp-0 rotate-45",
          )}
        />
      </button>
      {/* With motion off, the panel switches at once, with no exit to wait for. */}
      {off ? panel : <AnimatePresence initial={false}>{panel}</AnimatePresence>}
    </div>
  );
}

export function AllMatchups({ matchups, avatars }: { matchups: Matchup[]; avatars: AvatarMap }) {
  return (
    <Chapter>
      <Label>All Matchups</Label>
      {matchups.map((matchup, i) => (
        <Row key={matchup.id} matchup={matchup} avatars={avatars} first={i === 0} />
      ))}
    </Chapter>
  );
}
