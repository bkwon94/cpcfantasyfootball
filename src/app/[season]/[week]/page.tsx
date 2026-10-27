/**
 * The week page at /<season>/week-NN/, one static page per page.json in public/.
 * It renders the masthead with the week line and the week sections from that JSON.
 */
import type { Metadata } from "next";
import { Masthead, WeekLine } from "@/components/masthead";
import { AllMatchups } from "@/components/week/all-matchups";
import { Awards } from "@/components/week/awards";
import { GameChanger } from "@/components/week/game-changer";
import { MatchupOfTheWeek } from "@/components/week/matchup-of-the-week";
import { MedianGame } from "@/components/week/median-game";
import { NextWeek } from "@/components/week/next-week";
import { PositionLeaders } from "@/components/week/position-leaders";
import { Standings } from "@/components/week/standings";
import { Trades } from "@/components/week/trades";
import { basePath } from "@/lib/config";
import { listWeeks, loadWeek, type WeekRef } from "@/lib/week-data";

type Props = { params: Promise<WeekRef> };

// The export is static, so a week with no JSON at build time has no page.
export const dynamicParams = false;

export function generateStaticParams(): WeekRef[] {
  return listWeeks();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season, week } = await params;
  const page = loadWeek(season, week);
  return {
    title: `Week ${page.week} · Cornerstone Fantasy Football League`,
    description: page.summary,
    // The pipeline reads this meta from a week page to list the week on the home page.
    other: { "cornerstone-summary": page.summary },
  };
}

export default async function WeekPage({ params }: Props) {
  const { season, week } = await params;
  const page = loadWeek(season, week);
  return (
    <>
      <Masthead subtitle="League Weekly" pageHref={`${basePath}/${season}/${week}/`}>
        <WeekLine label="WEEK" number={page.week} />
        <div className="mt-sp-1 text-meta text-on-dark-2 tabular-nums">
          {/* One string, so React writes one text node and the browser kerns the line as one run. */}
          {`${page.dates} · Published ${page.publish_date}`}
        </div>
      </Masthead>
      <main className="mx-auto max-w-page bg-wht">
        {/* The masthead and the top story show at once. The hero plays its own motion on load.
            Each chapter below reveals once as it enters the view, as a unit or card by card. */}
        <MatchupOfTheWeek pick={page.pick} avatars={page.avatars} blurb={page.blurbs.motw} />
        {page.game_changer && (
          <GameChanger gameChanger={page.game_changer} headshots={page.headshots} blurb={page.blurbs.game_changer} />
        )}
        <Awards awards={page.awards} headshots={page.headshots} blurb={page.blurbs.awards} />
        {page.leaders.length > 0 && (
          <PositionLeaders leaders={page.leaders} headshots={page.headshots} blurb={page.blurbs.position_leaders} />
        )}
        <Trades trades={page.trades} avatars={page.avatars} />
        <AllMatchups matchups={page.matchups} avatars={page.avatars} />
        <MedianGame median={page.median} blurb={page.blurbs.median} />
        <Standings table={page.table} avatars={page.avatars} />
        <NextWeek week={page.week} games={page.next} avatars={page.avatars} blurb={page.blurbs.next_week} />
      </main>
    </>
  );
}
