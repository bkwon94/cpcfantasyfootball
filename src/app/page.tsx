/**
 * The home page at /: every published week, newest first, read from each week's page.json.
 * It is a server component, so the list is part of the static export.
 */
import type { Metadata } from "next";
import { Masthead, WeekLine } from "@/components/masthead";
import { Reveal } from "@/components/reveal";
import { Blurb, Chapter, Label } from "@/components/week/parts";
import { basePath } from "@/lib/config";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { listWeekSummaries } from "@/lib/week-data";

export const metadata: Metadata = {
  title: "Cornerstone League Weekly",
};

export default function HomePage() {
  const weeks = listWeekSummaries();
  return (
    <main className="mx-auto max-w-page bg-wht">
      <Masthead title="Cornerstone" subtitle="League Weekly">
        <WeekLine label="ALL WEEKS" />
      </Masthead>
      {/* The masthead and the label show at once. Each row reveals as it enters the view. */}
      <Chapter>
        <Label>Published weeks</Label>
        {weeks.length === 0 && <Blurb>No weeks are published yet.</Blurb>}
        {weeks.map((week, index) => (
          // Each row reveals once with a short, capped stagger, so a row in a long season list never shows late.
          <Reveal key={week.href} delay={stagger(index)}>
            {/* A plain anchor, like the masthead link. An anchor skips the router, so the code adds the base path by hand. */}
            <a
              href={`${basePath}${week.href}`}
              className={cn(
                "press group block border-b border-rule py-sp-3 text-inherit no-underline",
                // The label already gives the first row its top space.
                index === 0 && "pt-0",
              )}
            >
              <b className="mb-sp-1 block text-lead leading-tight group-hover:text-red">Week {week.number}</b>
              <span className="block text-meta text-mute tabular-nums">{week.dates}</span>
              <span className="block text-meta text-mute">{week.teams}</span>
            </a>
          </Reveal>
        ))}
      </Chapter>
    </main>
  );
}
