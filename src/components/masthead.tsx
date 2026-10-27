/**
 * The black masthead at the top of every page: the brand link, the page subtitle, an optional week line, and the waiver link.
 * It matches the masthead of the source stylesheet, so a reader cannot tell the two apart.
 */
import type { ReactNode } from "react";
import { basePath } from "@/lib/config";
import { currentWaiverHref } from "@/lib/waiver-data";

/* The week line lives in its own file, so a client component can import it. The pages import it from here. */
export { WeekLine } from "@/components/week-line";

type MastheadProps = {
  // The brand line. It defaults to the league name, which every page shows.
  title?: string;
  // The page line under the brand. The home page leaves it out.
  subtitle?: string;
  // The week line under the brand. Pages with no week line leave it out.
  children?: ReactNode;
  // The waiver page link. Left out, the masthead reads the current week from public/, and a build with the flag off gets null.
  // A test passes a value to set the link without a temp public/ folder.
  waiverHref?: string | null;
};

export function Masthead({
  title = "Cornerstone Fantasy Football League",
  subtitle,
  children,
  waiverHref = currentWaiverHref(),
}: MastheadProps) {
  return (
    // The black band spans the viewport at every tier. The inner box takes the page column, so the content lines up with the page below.
    <header className="bg-blk text-on-dark">
      <div className="mx-auto max-w-page px-gutter pt-sp-5 pb-sp-4">
        {/* A plain anchor, not next/link: the home page is a static page with no shared state, so the client router adds nothing. */}
        <a href={`${basePath}/`} className="flex items-center gap-sp-3 text-inherit no-underline">
          {/* The title next to the logo names the link, so the logo is decorative. */}
          <img src={`${basePath}/images/logo.png`} alt="" className="size-logo flex-none rounded-full" />
          <div className="h-divider w-px bg-mute" />
          <div>
            <div className="text-meta leading-tight font-bold tracking-wide uppercase">{title}</div>
            {subtitle && <div className="text-label tracking-caps text-on-dark-muted uppercase">{subtitle}</div>}
          </div>
        </a>
        {children && <div className="mt-sp-4">{children}</div>}
        {/* A plain anchor, as the brand link is. The touch height keeps the small label easy to tap on a phone. */}
        {waiverHref && (
          <a
            href={waiverHref}
            className="mt-sp-2 inline-flex min-h-touch items-center text-label font-bold tracking-caps text-red-lt uppercase no-underline"
          >
            Waiver wire
          </a>
        )}
      </div>
    </header>
  );
}
