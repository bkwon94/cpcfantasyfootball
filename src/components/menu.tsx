/**
 * The menu of the site: the menu button and the sheet it opens, and the desktop row with the Past weeks popover.
 * It is the client island of the masthead, so the masthead stays a server component and passes the destinations in.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useRef, useState } from "react";
import { Dialog, DialogOverlay, DialogPopup, DialogPortal, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DROP, DURATION, EASE_OUT, INSTANT, stagger, useMotionOff } from "@/lib/motion";

/* One place the menu links to. The href carries the base path, because every link is a plain anchor. */
export type Destination = { label: string; href: string };

/* The destinations of the menu: the pages first, then the past weeks, newest first, under their own heading. */
export type Destinations = { pages: Destination[]; pastWeeks: Destination[] };

type MenuProps = {
  destinations: Destinations;
  // The href of the open page. The item with the same href carries the current-page state.
  pageHref?: string;
};

/* The distance in px of the top and the bottom line of the icon from its middle line. */
const LINE_GAP = 5;

/* The menu button icon: three lines that turn into a cross. With motion off, the icon switches with no morph. */
function MenuIcon({ open, off }: { open: boolean; off: boolean }) {
  const transition = off ? INSTANT : { duration: DURATION.iconMorph, ease: EASE_OUT };
  const line = "absolute inset-x-0 top-1/2 -mt-px h-sp-0 rounded-full bg-current";
  return (
    <span aria-hidden className="relative block size-sp-5">
      <motion.span
        className={line}
        initial={false}
        animate={open ? { y: 0, rotate: 45 } : { y: -LINE_GAP, rotate: 0 }}
        transition={transition}
      />
      <motion.span className={line} initial={false} animate={{ opacity: open ? 0 : 1 }} transition={transition} />
      <motion.span
        className={line}
        initial={false}
        animate={open ? { y: 0, rotate: -45 } : { y: LINE_GAP, rotate: 0 }}
        transition={transition}
      />
    </span>
  );
}

type ItemProps = { destination: Destination; pageHref?: string; index: number; off: boolean };

/* One link of the menu. A plain anchor, so the static export navigates with scripts off and with no client router. */
function Item({ destination, pageHref, index, off }: ItemProps) {
  return (
    <motion.li
      initial={off ? false : { opacity: 0, y: DROP }}
      animate={{ opacity: 1, y: 0 }}
      transition={off ? INSTANT : { duration: DURATION.collapse, ease: EASE_OUT, delay: stagger(index) }}
    >
      {/* The current-page state sets the red accent too, so the mark a reader sees and the state a screen reader speaks never differ. */}
      <a
        href={destination.href}
        aria-current={destination.href === pageHref ? "page" : undefined}
        className="press flex min-h-touch items-center border-b border-rule text-lead font-bold text-ink no-underline hover-fine:text-red aria-[current=page]:text-red"
      >
        {destination.label}
      </a>
    </motion.li>
  );
}

/* One link of the desktop row. The band is black, so the red accent is the light red, as in the noscript row of the masthead. */
function RowLink({ destination, pageHref }: { destination: Destination; pageHref?: string }) {
  return (
    <a
      href={destination.href}
      aria-current={destination.href === pageHref ? "page" : undefined}
      className="press inline-flex min-h-touch items-center text-label font-bold tracking-caps text-on-dark uppercase no-underline hover-fine:text-red-lt aria-[current=page]:text-red-lt"
    >
      {destination.label}
    </a>
  );
}

/* The scale the popover starts from. It is close to 1, so the popover grows out of its trigger and does not pop. */
const POPOVER_SCALE = 0.95;

/* The menu as a row of links for the desktop tier. It renders the same destinations as the sheet, so an item lives in one place. */
function Row({ destinations, pageHref }: MenuProps) {
  const off = useMotionOff();
  return (
    // The row shows from the desktop tier up, where the menu button hides. With scripts off the noscript row of the masthead takes its place.
    <nav
      aria-label="Site menu"
      className="hidden items-center gap-x-sp-4 desktop:flex [@media(scripting:none)]:hidden"
    >
      {destinations.pages.map((destination) => (
        <RowLink key={destination.href} destination={destination} pageHref={pageHref} />
      ))}
      {destinations.pastWeeks.length > 0 && (
        <Popover>
          <PopoverTrigger className="press inline-flex min-h-touch items-center text-label font-bold tracking-caps text-on-dark uppercase hover-fine:text-red-lt">
            Past weeks
          </PopoverTrigger>
          {/* Framer Motion owns the scale and the fade, so the CSS keyframes of the primitive are off.
              The primitive sets transform-origin to Base UI's --transform-origin, so the popover grows from the trigger. */}
          <PopoverContent
            aria-label="Past weeks"
            align="end"
            className="w-48 gap-0 rounded-none p-0 px-sp-4 py-sp-1 data-open:animate-none data-closed:animate-none"
            render={
              <motion.div
                initial={off ? false : { opacity: 0, scale: POPOVER_SCALE }}
                animate={{ opacity: 1, scale: 1 }}
                transition={off ? INSTANT : { duration: DURATION.popover, ease: EASE_OUT }}
              />
            }
          >
            <ul className="m-0 list-none p-0">
              {destinations.pastWeeks.map((destination) => (
                <li key={destination.href} className="border-b border-rule last:border-b-0">
                  <a
                    href={destination.href}
                    aria-current={destination.href === pageHref ? "page" : undefined}
                    className="press flex min-h-touch items-center text-lead font-bold text-ink no-underline hover-fine:text-red aria-[current=page]:text-red"
                  >
                    {destination.label}
                  </a>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </nav>
  );
}

export function Menu({ destinations, pageHref }: MenuProps) {
  const [open, setOpen] = useState(false);
  const off = useMotionOff();
  const listId = useId();
  const pastId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The top of the sheet in the viewport. The sheet hangs from the bottom of the masthead, or from the top once the masthead scrolls out.
  const [top, setTop] = useState(0);

  function openChange(next: boolean) {
    if (next) {
      const masthead = buttonRef.current?.closest("header");
      setTop(Math.max(0, masthead?.getBoundingClientRect().bottom ?? 0));
    }
    setOpen(next);
  }

  // The sheet drops and fades in, and leaves faster along the same path. With motion off it only cross-fades.
  const offset = off ? {} : { y: DROP };
  const sheet = {
    initial: { opacity: 0, ...offset },
    animate: { opacity: 1, y: 0, transition: { duration: DURATION.collapse, ease: EASE_OUT } },
    exit: { opacity: 0, ...offset, transition: { duration: DURATION.sheetExit, ease: EASE_OUT } },
  };
  const backdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: DURATION.collapse, ease: EASE_OUT } },
    exit: { opacity: 0, transition: { duration: DURATION.sheetExit, ease: EASE_OUT } },
  };
  // The index of an item in the whole sheet, so the past weeks continue the stagger of the pages.
  const pastStart = destinations.pages.length;

  return (
    <>
      <Row destinations={destinations} pageHref={pageHref} />
      <Dialog open={open} onOpenChange={openChange}>
        <DialogTrigger
          ref={buttonRef}
          aria-label="Menu"
          aria-controls={listId}
          // With scripts off the button can open nothing, so it hides, and the masthead shows the destinations as plain links.
          // From the desktop tier up the row shows the destinations, so the button hides.
          className="press -mr-sp-3 flex size-touch flex-none items-center justify-center text-on-dark desktop:hidden [@media(scripting:none)]:hidden"
        >
          <MenuIcon open={open} off={off} />
        </DialogTrigger>
        {/* Base UI keeps the portal while the exit plays, and AnimatePresence removes it after, as the Base UI docs show for Motion. */}
        <AnimatePresence>
          {open && (
            <DialogPortal keepMounted>
              {/* The dimmed page starts under the masthead, so the masthead and the cross of the button stay clear.
                  Framer Motion owns the fade, so the CSS fade and the blur of the primitive are off. */}
              <DialogOverlay
                className="bg-blk/50 data-open:animate-none data-closed:animate-none supports-backdrop-filter:backdrop-blur-none"
                style={{ top }}
                render={<motion.div {...backdrop} />}
              />
              <DialogPopup
                aria-label="Menu"
                className="fixed inset-x-0 z-50 overflow-y-auto overscroll-contain bg-wht text-ink outline-none"
                style={{ top, maxHeight: `calc(100dvh - ${top}px)` }}
                render={<motion.div {...sheet} />}
              >
                <nav id={listId} aria-label="Menu" className="mx-auto max-w-page px-gutter pb-sp-6">
                  <ul className="m-0 list-none p-0">
                    {destinations.pages.map((destination, index) => (
                      <Item key={destination.href} destination={destination} pageHref={pageHref} index={index} off={off} />
                    ))}
                  </ul>
                  {destinations.pastWeeks.length > 0 && (
                    <>
                      <h2
                        id={pastId}
                        className="mt-sp-5 mb-0 text-label leading-tight font-bold tracking-wide text-red uppercase"
                      >
                        Past weeks
                      </h2>
                      <ul aria-labelledby={pastId} className="m-0 list-none p-0">
                        {destinations.pastWeeks.map((destination, index) => (
                          <Item
                            key={destination.href}
                            destination={destination}
                            pageHref={pageHref}
                            index={pastStart + index}
                            off={off}
                          />
                        ))}
                      </ul>
                    </>
                  )}
                </nav>
              </DialogPopup>
            </DialogPortal>
          )}
        </AnimatePresence>
      </Dialog>
    </>
  );
}
