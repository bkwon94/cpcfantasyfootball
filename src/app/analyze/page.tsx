/**
 * The trade analyzer route at /analyze/.
 * It renders the masthead and the client analyzer in the centered page column on the white page background.
 */
import type { Metadata } from "next";
import { Analyzer } from "@/components/analyzer";
import { Masthead } from "@/components/masthead";

export const metadata: Metadata = {
  title: "Trade Analyzer · Cornerstone Fantasy Football League",
};

export default function AnalyzePage() {
  return (
    <main className="mx-auto max-w-page bg-wht">
      <Masthead subtitle="Trade Analyzer" />
      <Analyzer />
    </main>
  );
}
