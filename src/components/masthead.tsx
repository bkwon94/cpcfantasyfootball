/**
 * The black masthead at the top of every page: the brand link, the page subtitle, and an optional week line.
 * It matches the masthead of the source stylesheet, so a reader cannot tell the two apart.
 */
import type { ReactNode } from "react";
import { basePath } from "@/lib/config";

type MastheadProps = {
  // The brand line. It defaults to the league name, which every page shows.
  title?: string;
  // The page line under the brand. The home page leaves it out.
  subtitle?: string;
  // The week line under the brand. Pages with no week line leave it out.
  children?: ReactNode;
};

export function Masthead({ title = "Cornerstone Fantasy Football League", subtitle, children }: MastheadProps) {
  return (
    <header className="bg-blk px-gutter pt-sp-5 pb-sp-4 text-on-dark">
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
    </header>
  );
}

/* The big week line in the masthead. The number, when given, takes the red accent. */
export function WeekLine({ label, number }: { label: string; number?: number }) {
  return (
    <div className="text-headline leading-none font-black tracking-tight">
      {number === undefined ? (
        label
      ) : (
        <>
          {/* One string, so React writes one text node and the browser kerns the label as one run. */}
          {`${label} `}
          <span className="text-red">{number}</span>
        </>
      )}
    </div>
  );
}
