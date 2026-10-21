/**
 * Root layout for the app. It sets the viewport meta and loads globals.css.
 * Every page of the site uses it.
 */
import "./globals.css";
import type { Viewport } from "next";
import type { ReactNode } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Every browser honors noscript. The (scripting: none) query in globals.css does not reach older browsers,
            so this rule shows every reveal box at rest when scripts are off. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
