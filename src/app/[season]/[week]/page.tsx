/**
 * The week page at /<season>/week-NN/, one static page per page.json in public/.
 * It renders the masthead with the week line and the week sections from that JSON.
 */
import type { Metadata } from "next";
import { Masthead, WeekLine } from "@/components/masthead";
import { Reveal } from "@/components/reveal";
import { AllMatchups } from "@/components/week/all-matchups";
import { Awards } from "@/components/week/awards";
import { GameChanger } from "@/components/week/game-changer";
import { MatchupOfTheWeek } from "@/components/week/matchup-of-the-week";
import { MedianGame } from "@/components/week/median-game";
import { NextWeek } from "@/components/week/next-week";
import { PositionLeaders } from "@/components/week/position-leaders";
import { Standings } from "@/components/week/standings";
import { Trades } from "@/components/week/trades";
import { DURATION } from "@/lib/motion";
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
    title: `Cornerstone League Weekly · Week ${page.week}`,
    description: page.summary,
    // The pipeline reads this meta from a week page to list the week on the home page.
    other: { "cornerstone-summary": page.summary },
  };
}

export default async function WeekPage({ params }: Props) {
  const { season, week } = await params;
  const page = loadWeek(season, week);
  return (
    <main className="mx-auto max-w-page bg-wht">
      <Masthead title="Cornerstone" subtitle="League Weekly">
        <WeekLine label="WEEK" number={page.week} />
        <div className="mt-sp-1 text-meta text-on-dark-2 tabular-nums">
          {/* One string, so React writes one text node and the browser kerns the line as one run. */}
          {`${page.dates} · Published ${page.publish_date}`}
        </div>
      </Masthead>
      {/* The content of the route fades and rises in once, as the analyzer does. The masthead stays still. */}
      <Reveal trigger="mount" duration={DURATION.page}>
        {/* The first chapter is above the fold, so the route enter is its reveal. The hero has its own three beats. */}
        <MatchupOfTheWeek pick={page.pick} avatars={page.avatars} blurb={page.blurbs.motw} />
        {page.game_changer && (
          <GameChanger gameChanger={page.game_changer} headshots={page.headshots} blurb={page.blurbs.game_changer} />
        )}
        {/* Each chapter below the hero reveals once, when the reader scrolls to it. */}
        <Reveal>
          <Awards awards={page.awards} headshots={page.headshots} blurb={page.blurbs.awards} />
        </Reveal>
        {page.leaders.length > 0 && (
          <Reveal>
            <PositionLeaders leaders={page.leaders} headshots={page.headshots} blurb={page.blurbs.position_leaders} />
          </Reveal>
        )}
        {page.trades.length > 0 && (
          <Reveal>
            <Trades trades={page.trades} avatars={page.avatars} />
          </Reveal>
        )}
        <Reveal>
          <AllMatchups matchups={page.matchups} avatars={page.avatars} />
        </Reveal>
        {page.median && (
          <Reveal>
            <MedianGame median={page.median} blurb={page.blurbs.median} />
          </Reveal>
        )}
        <Reveal>
          <Standings table={page.table} avatars={page.avatars} />
        </Reveal>
        <Reveal>
          <NextWeek week={page.week} games={page.next} avatars={page.avatars} blurb={page.blurbs.next_week} />
        </Reveal>
      </Reveal>
    </main>
  );
}
