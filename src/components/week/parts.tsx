/**
 * The small parts every week section shares: the chapter, the label, the tag, the blurb, the avatar, and the headshot.
 * They port the .chap, .lbl, .tag, .blurb, .avatar, and .headshot rules of the source stylesheet.
 */
import type { ReactNode } from "react";
import { basePath } from "@/lib/config";
import { HEADSHOT_FALLBACK } from "@/lib/headshot";
import type { AvatarMap, HeadshotMap } from "@/lib/week-types";
import { cn } from "@/lib/utils";

const AVATAR_FALLBACK = `${basePath}/images/avatar-default.svg`;

/* The JSON paths are relative to the week folder. The route ends in a slash, so the browser resolves them as given. */
export function avatarSrc(avatars: AvatarMap, rosterId: number): string {
  return avatars[String(rosterId)] ?? AVATAR_FALLBACK;
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

/* The red uppercase label that opens a chapter or a card. A label inside a card passes mb-sp-1 to sit close to its content. */
export function Label({ children, dark, className }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "text-label leading-tight font-bold tracking-wide uppercase",
        "mb-sp-3",
        dark ? "text-red-lt" : "text-red",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* A tag after a label sits to its right. A tag on its own line passes ml-0 and its own top margin. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "ml-sp-2 inline-block rounded-sm bg-red px-sp-2 py-sp-0 align-middle text-label font-bold tracking-caps text-on-dark uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* A blurb under a grid of cards passes mt-sp-3 for the space above it. */
export function Blurb({ children, dark, className }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <p className={cn("m-0 text-body", dark ? "text-on-dark-2" : "text-ink-2", className)}>{children}</p>;
}

/* The team name sits next to the avatar, so the image is decorative. */
export function Avatar({ src }: { src: string }) {
  return <img src={src} alt="" className="size-avatar flex-none rounded-full bg-gry object-cover" />;
}

/* The avatar and the team name as one group, as the .who rule of the stylesheet sets it.
   Fill makes the group take the free width of a row and lets a long name wrap inside it. */
export function Who({ src, name, fill }: { src: string; name: string; fill?: boolean }) {
  return (
    <span className={cn("items-center gap-sp-2 align-middle", fill ? "flex min-w-0 flex-1" : "inline-flex")}>
      <Avatar src={src} />
      <span className={cn(fill && "min-w-0")}>{name}</span>
    </span>
  );
}

/* The player name sits next to the headshot, so the image is decorative. A className sets the size, the shape, and the layout.
   A player with no entry in the map gets the default headshot. */
export function Headshot({
  playerId,
  headshots,
  lazy,
  className,
}: {
  playerId: string;
  headshots: HeadshotMap;
  lazy?: boolean;
  className?: string;
}) {
  return (
    <img
      src={headshots[playerId] ?? HEADSHOT_FALLBACK}
      alt=""
      loading={lazy ? "lazy" : undefined}
      className={cn("flex-none object-cover", className)}
    />
  );
}
