/**
 * The home page at /: every published week, newest first, read from each week's page.json.
 * It is a server component, so the list is part of the static export.
 */
import type { Metadata } from "next";
import { Masthead } from "@/components/masthead";
import { Blurb, Chapter, Label } from "@/components/week/parts";
import { basePath } from "@/lib/config";
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
        <div className="text-headline leading-none font-black tracking-tight">ALL WEEKS</div>
      </Masthead>
      <Chapter>
        <Label>Published weeks</Label>
        {weeks.length === 0 && <Blurb>No weeks are published yet.</Blurb>}
        {weeks.map((week, index) => (
          // A plain link, like the masthead link: an anchor keeps the base path and needs no router.
          <a
            key={week.href}
            href={`${basePath}${week.href}`}
            className={cn(
              "press group block border-b border-rule py-sp-3 text-inherit no-underline",
              // The label already gives the first row its top space.
              index === 0 && "pt-0",
            )}
          >
            <b className="mb-sp-1 block text-lead leading-tight group-hover:text-red">Week {week.number}</b>
            <span className="block text-meta text-muted tabular-nums">{week.dates}</span>
            <span className="block text-meta text-muted">{week.teams}</span>
          </a>
        ))}
      </Chapter>
    </main>
  );
}
