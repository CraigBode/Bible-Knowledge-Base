import Link from "next/link";
import { db } from "@/db";
import {
  books,
  passages,
  notes,
  wordStudies,
  crossReferences,
  themes,
  passageThemes,
  sources,
} from "@/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import { EXEGETICAL_STEPS, formatReference } from "@/lib/exegesis";
import { PageHeader, StatCard, StatusBadge, ThemeChip, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await ensureSeeded();

  const [
    [{ n: passageCount }],
    [{ n: noteCount }],
    [{ n: wordCount }],
    [{ n: xrefCount }],
    [{ n: sourceCount }],
    recent,
    themeCounts,
    byTestament,
    noteByType,
    statusCounts,
  ] = await Promise.all([
    db.select({ n: count() }).from(passages),
    db.select({ n: count() }).from(notes),
    db.select({ n: count() }).from(wordStudies),
    db.select({ n: count() }).from(crossReferences),
    db.select({ n: count() }).from(sources),
    db.query.passages.findMany({
      orderBy: [desc(passages.updatedAt)],
      limit: 6,
      with: { book: true, passageThemes: { with: { theme: true } } },
    }),
    db
      .select({
        id: themes.id,
        name: themes.name,
        slug: themes.slug,
        color: themes.color,
        n: count(passageThemes.passageId),
      })
      .from(themes)
      .leftJoin(passageThemes, eq(passageThemes.themeId, themes.id))
      .groupBy(themes.id)
      .orderBy(desc(count(passageThemes.passageId)), themes.name),
    db
      .select({ testament: books.testament, n: count(passages.id) })
      .from(books)
      .leftJoin(passages, eq(passages.bookId, books.id))
      .groupBy(books.testament),
    db.select({ type: notes.type, n: count() }).from(notes).groupBy(notes.type),
    db.select({ status: passages.status, n: count() }).from(passages).groupBy(passages.status),
  ]);

  const noteTypeMap = new Map(noteByType.map((r) => [r.type, r.n]));
  const ot = byTestament.find((t) => t.testament === "OT")?.n ?? 0;
  const nt = byTestament.find((t) => t.testament === "NT")?.n ?? 0;
  const statusMap = new Map(statusCounts.map((s) => [s.status, s.n]));

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Exegesis Knowledge Base"
        description="Passage studies organized by the classical exegetical method — observation through application — with original-language word studies, cross-references, and a working bibliography."
        actions={
          <>
            <Link href="/passages/new" className="btn btn-primary">
              + New passage study
            </Link>
            <Link href="/setup" className="btn btn-secondary">
              Setup
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Passage studies" value={passageCount} hint={`${ot} OT · ${nt} NT`} href="/passages" />
        <StatCard label="Exegetical notes" value={noteCount} hint="across all steps" href="/passages" />
        <StatCard label="Word studies" value={wordCount} hint="Hebrew · Aramaic · Greek" href="/lexicon" />
        <StatCard label="Cross-references" value={xrefCount} hint="typed intertextual links" href="/passages" />
        <StatCard label="Sources" value={sourceCount} hint="bibliography entries" href="/library" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle
            right={
              <Link href="/passages" className="text-sm text-oxblood-700 hover:underline">
                View all →
              </Link>
            }
          >
            Recent studies
          </SectionTitle>
          {recent.length === 0 ? (
            <div className="card p-6 text-sm text-ink-700">
              No studies yet.{" "}
              <Link href="/passages/new" className="text-oxblood-700 underline">
                Start one
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  href={`/passages/${p.id}`}
                  className="card group flex flex-col p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                      {formatReference(p.book, p.chapterStart, p.verseStart, p.chapterEnd, p.verseEnd)}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-1 font-serif text-lg font-semibold leading-snug text-ink-900 group-hover:text-oxblood-700">
                    {p.title}
                  </div>
                  {p.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-700">{p.summary}</p>
                  )}
                  {p.passageThemes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.passageThemes.slice(0, 3).map((pt) => (
                        <ThemeChip key={pt.themeId} theme={pt.theme} link={false} />
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            <SectionTitle>The exegetical method</SectionTitle>
            <div className="card divide-y divide-parchment-200">
              {EXEGETICAL_STEPS.map((s) => {
                const n = noteTypeMap.get(s.type) ?? 0;
                return (
                  <div key={s.type} className="flex items-start gap-4 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oxblood-700 font-serif text-sm font-bold text-amber-100">
                      {s.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif font-semibold text-ink-900">{s.label}</div>
                        <div className="text-xs text-ink-700/70">
                          {n} {n === 1 ? "note" : "notes"}
                        </div>
                      </div>
                      <div className="text-sm italic text-oxblood-700">{s.question}</div>
                      <p className="mt-1 text-sm text-ink-700">{s.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <SectionTitle>Progress</SectionTitle>
            <div className="card p-4">
              {(["complete", "in_progress", "draft"] as const).map((s) => {
                const n = statusMap.get(s) ?? 0;
                const pct = passageCount ? Math.round((n / passageCount) * 100) : 0;
                const color =
                  s === "complete" ? "bg-emerald-500" : s === "in_progress" ? "bg-amber-500" : "bg-stone-400";
                return (
                  <div key={s} className="mb-3 last:mb-0">
                    <div className="mb-1 flex justify-between text-xs text-ink-700">
                      <span className="capitalize">{s.replace("_", " ")}</span>
                      <span>
                        {n} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-parchment-200">
                      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionTitle
              right={
                <Link href="/themes" className="text-sm text-oxblood-700 hover:underline">
                  Manage →
                </Link>
              }
            >
              Themes
            </SectionTitle>
            <div className="card p-4">
              <div className="flex flex-wrap gap-2">
                {themeCounts.map((t) => (
                  <Link
                    key={t.id}
                    href={`/themes/${t.slug}`}
                    className="chip border hover:opacity-80"
                    style={{
                      backgroundColor: `${t.color}1a`,
                      color: t.color,
                      borderColor: `${t.color}55`,
                      fontSize: `${Math.min(1.05, 0.72 + t.n * 0.06)}rem`,
                    }}
                  >
                    {t.name}
                    <span className="opacity-60">{t.n}</span>
                  </Link>
                ))}
                {themeCounts.length === 0 && (
                  <span className="text-sm text-ink-700">No themes yet.</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <SectionTitle>Canon coverage</SectionTitle>
            <CanonCoverage />
          </div>
        </div>
      </div>
    </div>
  );
}

async function CanonCoverage() {
  const rows = await db
    .select({
      id: books.id,
      abbreviation: books.abbreviation,
      name: books.name,
      testament: books.testament,
      n: sql<number>`count(${passages.id})::int`,
    })
    .from(books)
    .leftJoin(passages, eq(passages.bookId, books.id))
    .groupBy(books.id)
    .orderBy(books.orderIndex);

  const render = (t: "OT" | "NT") => (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-700/70">
        {t === "OT" ? "Old Testament" : "New Testament"}
      </div>
      <div className="flex flex-wrap gap-1">
        {rows
          .filter((r) => r.testament === t)
          .map((r) => (
            <Link
              key={r.id}
              href={`/passages?book=${r.id}`}
              title={`${r.name}: ${r.n} ${r.n === 1 ? "study" : "studies"}`}
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                r.n > 0
                  ? "bg-oxblood-700 text-amber-50 hover:bg-oxblood-800"
                  : "bg-parchment-200 text-ink-700/60 hover:bg-parchment-300"
              }`}
            >
              {r.abbreviation}
            </Link>
          ))}
      </div>
    </div>
  );

  return (
    <div className="card space-y-3 p-4">
      {render("OT")}
      {render("NT")}
    </div>
  );
}
