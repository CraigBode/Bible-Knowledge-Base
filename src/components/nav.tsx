"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

const links = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/passages", label: "Passage Studies", icon: "§" },
  { href: "/lexicon", label: "Lexicon", icon: "א" },
  { href: "/themes", label: "Themes", icon: "❖" },
  { href: "/library", label: "Library", icon: "▤" },
  { href: "/setup", label: "Knowledge Base Setup", icon: "⚙" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5">
      {links.map((l) => {
        const active =
          l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap ${
              active
                ? "bg-oxblood-700 text-white shadow-sm"
                : "text-ink-700 hover:bg-parchment-200 hover:text-oxblood-700"
            }`}
          >
            <span
              className={`w-5 text-center font-serif text-base ${
                active ? "text-amber-200" : "text-gold-500"
              }`}
            >
              {l.icon}
            </span>
            {l.label}
          </Link>
        );
      })}
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-parchment-200 hover:text-oxblood-700"
        >
          <span className="w-5 text-center font-serif text-base text-gold-500">⏻</span>
          Log out
        </button>
      </form>
    </nav>
  );
}
