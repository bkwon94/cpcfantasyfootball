/**
 * The black masthead at the top of every page: the brand link, the page subtitle, and an optional week line.
 * It matches the masthead of the Jinja pages, so a reader cannot tell the two apart.
 */
import type { ReactNode } from "react";
import { basePath } from "@/lib/config";

type MastheadProps = {
  // The brand line. The week pages keep the old "Cornerstone" brand, so a reader sees no change.
  title?: string;
  subtitle: string;
  // The week line under the brand. Pages with no week line leave it out.
  children?: ReactNode;
};

export function Masthead({ title = "CPC Fantasy", subtitle, children }: MastheadProps) {
  return (
    <header className="bg-blk px-gutter pt-sp-5 pb-sp-4 text-on-dark">
      {/* A plain link, not next/link: the home page is a static file, not an app route. */}
      <a href={`${basePath}/`} className="flex items-center gap-sp-3 text-inherit no-underline">
        {/* The title next to the logo names the link, so the logo is decorative. */}
        <img src={`${basePath}/images/logo.png`} alt="" className="size-logo flex-none rounded-full" />
        <div className="h-divider w-px bg-mute" />
        <div>
          <div className="text-meta leading-tight font-bold tracking-wide uppercase">{title}</div>
          <div className="text-label tracking-caps text-on-dark-muted uppercase">{subtitle}</div>
        </div>
      </a>
      {children && <div className="mt-sp-4">{children}</div>}
    </header>
  );
}
