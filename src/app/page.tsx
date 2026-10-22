/**
 * The home page at /: every published week, newest first, read from each week's page.json.
 * It is a server component, so the list is part of the static export.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Masthead, WeekLine } from "@/components/masthead";
import { Reveal } from "@/components/reveal";
import { TeamsPrefetch } from "@/components/teams-prefetch";
import { Blurb, Chapter, Label } from "@/components/week/parts";
import { basePath, season } from "@/lib/config";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { listWeekSummaries } from "@/lib/week-data";

export const metadata: Metadata = {
  title: "Cornerstone Fantasy Football League",
};

/* A plain anchor, like the masthead link. An anchor skips the router, so the caller adds the base path by hand. */
function HomeRow({ href, first, children }: { href: string; first?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "press group block border-b border-rule py-sp-3 text-inherit no-underline",
        // The label already gives the first row its top space.
        first && "pt-0",
      )}
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  const weeks = listWeekSummaries();
  return (
    <main className="mx-auto max-w-page bg-wht">
      {/* A reader who opens the analyzer next sees the pickers at once, because the teams are already in session storage. */}
      <TeamsPrefetch />
      <Masthead>
        <WeekLine label="SEASON" number={season} />
      </Masthead>
      {/* The masthead and the label show at once. Each row reveals as it enters the view. */}
      <Chapter>
        <Label>Tools</Label>
        {/* The row reveals first, so a new week never pushes it down or delays it. */}
        <Reveal delay={stagger(0)}>
          <HomeRow href={`${basePath}/analyze/`} first>
            <b className="mb-sp-1 block text-lead leading-tight group-hover:text-red">Trade Analyzer</b>
            <span className="block text-meta text-mute">Grade a trade offer before you send it.</span>
            <span className="block text-meta text-mute">League passphrase needed.</span>
          </HomeRow>
        </Reveal>
      </Chapter>
      <Chapter>
        <Label>Published weeks</Label>
        {weeks.length === 0 && <Blurb>No weeks are published yet.</Blurb>}
        {weeks.map((week, index) => (
          // Each row reveals once after the tools row, with a short, capped stagger, so a row in a long season list never shows late.
          <Reveal key={week.href} delay={stagger(index + 1)}>
            <HomeRow href={`${basePath}${week.href}`} first={index === 0}>
              <b className="mb-sp-1 block text-lead leading-tight group-hover:text-red">Week {week.number}</b>
              <span className="block text-meta text-mute tabular-nums">{week.dates}</span>
            </HomeRow>
          </Reveal>
        ))}
      </Chapter>
    </main>
  );
}
