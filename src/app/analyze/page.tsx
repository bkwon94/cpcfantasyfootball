/**
 * The trade analyzer route at /analyze/.
 * It renders the masthead in the centered page column on the white page background.
 */
import type { Metadata } from "next";
import { Masthead } from "@/components/masthead";

export const metadata: Metadata = {
  title: "Trade Analyzer · CPC Fantasy",
};

export default function AnalyzePage() {
  return (
    <main className="mx-auto max-w-page bg-wht">
      <Masthead subtitle="Trade Analyzer" />
    </main>
  );
}
