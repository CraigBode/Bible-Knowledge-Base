import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Exegesis Knowledge Base",
  description:
    "A structured knowledge base for biblical exegesis: passage studies, word studies, cross-references, themes, and bibliography.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col md:flex-row">
          <aside className="border-b border-parchment-300 bg-parchment-50/80 backdrop-blur md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
            <div className="flex flex-col gap-4 p-4 md:h-full md:p-5">
              <Link href="/" className="group block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-oxblood-700 font-serif text-xl font-bold text-amber-100 shadow">
                    Λ
                  </div>
                  <div>
                    <div className="font-serif text-lg font-semibold leading-tight text-ink-900 group-hover:text-oxblood-700">
                      Exegesis KB
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-ink-700/70">
                      Ad fontes
                    </div>
                  </div>
                </div>
              </Link>
              <Nav />
              <div className="mt-auto hidden rounded-lg border border-parchment-300 bg-parchment-100 p-3 text-xs leading-relaxed text-ink-700 md:block">
                <p className="font-serif italic">
                  “Let the reader understand.”
                </p>
                <p className="mt-1 text-ink-700/70">Mark 13:14</p>
              </div>
            </div>
          </aside>
          <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
