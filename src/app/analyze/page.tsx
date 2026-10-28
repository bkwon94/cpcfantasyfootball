/**
 * The trade analyzer route at /analyze/.
 * It renders the masthead above the client analyzer, which sits in the centered page column on the white page background.
 */
import type { Metadata } from "next";
import { Analyzer } from "@/components/analyzer";
import { Masthead } from "@/components/masthead";
import { PageColumn } from "@/components/page-column";
import { basePath } from "@/lib/config";

export const metadata: Metadata = {
  title: "Trade Analyzer · Cornerstone Fantasy Football League",
};

export default function AnalyzePage() {
  return (
    <>
      <Masthead subtitle="Trade Analyzer" pageHref={`${basePath}/analyze/`} />
      <PageColumn>
        <Analyzer />
      </PageColumn>
    </>
  );
}
