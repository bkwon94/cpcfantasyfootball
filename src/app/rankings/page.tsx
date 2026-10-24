/**
 * The power rankings page at /rankings/, read from the season rankings file at build time.
 * It shows the last week in the file, or a short empty state when the pipeline has not written the file yet.
 */
import type { Metadata } from "next";
import { Masthead, WeekLine } from "@/components/masthead";
import { PowerRankings } from "@/components/rankings/power-rankings";
import { Blurb, Chapter, Label } from "@/components/week/parts";
import { latestAvatars, loadRankings } from "@/lib/rankings-data";

export const metadata: Metadata = {
  title: "Power Rankings · Cornerstone Fantasy Football League",
};

export default function RankingsPage() {
  const rankings = loadRankings();
  const week = rankings?.weeks.at(-1);
  return (
    <main className="mx-auto max-w-page bg-wht">
      <Masthead subtitle="Power Rankings">{week && <WeekLine label="WEEK" number={week.week} />}</Masthead>
      {rankings && week ? (
        <PowerRankings week={week} avatars={latestAvatars(rankings.season)} />
      ) : (
        <Chapter>
          <Label>Power rankings</Label>
          <Blurb>No power rankings are published yet.</Blurb>
        </Chapter>
      )}
    </main>
  );
}
