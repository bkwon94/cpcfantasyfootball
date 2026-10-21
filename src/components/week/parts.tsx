/**
 * The small parts every week section shares: the chapter, the label, the tag, the blurb, the avatar, and the headshot.
 * They port the .chap, .lbl, .tag, .blurb, .avatar, and .headshot rules of public/static/style.css.
 */
import type { ReactNode } from "react";
import { basePath } from "@/lib/config";
import type { AvatarMap, HeadshotMap } from "@/lib/week-types";
import { cn } from "@/lib/utils";

const AVATAR_FALLBACK = `${basePath}/images/avatar-default.svg`;
const HEADSHOT_FALLBACK = `${basePath}/images/headshot-default.svg`;

/* The JSON paths are relative to the week folder. The route ends in a slash, so the browser resolves them as given. */
export function avatarSrc(avatars: AvatarMap, rosterId: number): string {
  return avatars[String(rosterId)] ?? AVATAR_FALLBACK;
}

export function headshotSrc(headshots: HeadshotMap, playerId: string): string {
  return headshots[playerId] ?? HEADSHOT_FALLBACK;
}

/* A dark chapter is the black card. Its label and blurb take the dark prop for their on-dark colors. */
export function Chapter({ dark, id, children }: { dark?: boolean; id?: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className={cn("border-b-(length:--chap-rule) border-gry px-gutter py-sp-5", dark && "bg-blk text-on-dark")}
    >
      {children}
    </section>
  );
}

/* The red uppercase label that opens a chapter or a card. A label inside a card sits tight on its content.
   The tight flag sets the gap, not a className, because cn does not merge the custom spacing names. */
export function Label({
  children,
  dark,
  tight,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  tight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-label leading-tight font-bold tracking-wide uppercase",
        tight ? "mb-sp-1" : "mb-sp-3",
        dark ? "text-red-lt" : "text-red",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="ml-sp-2 inline-block rounded-sm bg-red px-sp-2 py-sp-0 align-middle text-label font-bold tracking-caps text-on-dark uppercase">
      {children}
    </span>
  );
}

/* The gap variant adds the top space a blurb needs under a grid of cards. */
export function Blurb({ children, dark, gap }: { children: ReactNode; dark?: boolean; gap?: boolean }) {
  return <p className={cn("m-0 text-body", dark ? "text-on-dark-2" : "text-ink-2", gap && "mt-sp-3")}>{children}</p>;
}

/* The team name sits next to the avatar, so the image is decorative. */
export function Avatar({ src }: { src: string }) {
  return <img src={src} alt="" className="size-avatar flex-none rounded-full bg-gry object-cover" />;
}

/* The player name sits next to the headshot, so the image is decorative. A className sets the size, the shape, and the layout. */
export function Headshot({ src, lazy, className }: { src: string; lazy?: boolean; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      loading={lazy ? "lazy" : undefined}
      className={cn("flex-none object-cover", className)}
    />
  );
}
