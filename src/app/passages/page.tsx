import Link from "next/link";
import { db } from "@/db";
import { books, passages, passageThemes, themes, notes } from "@/db/schema";
import { and, desc, eq, ilike, or, inArray, sql, type SQL } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import { formatReference, STATUS_META, type StudyStatus } from "@/lib/exegesis";
import { PageHeader, StatusBadge, ThemeChip, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  book?: string;
  testament?: string;
  status?: string;
  theme?: string;
};

export default async function PassagesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await ensureSeeded();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const bookId = sp.book ? parseInt(sp.book, 10) : NaN;
  const testament = sp.testament === "OT" || sp.testament === "NT" ? sp.testament : undefined;
  const status = sp.status && sp.status in STATUS_META ? (sp.status as StudyStatus) : undefined;
  const themeSlug = sp.theme?.trim() || undefined;

  const conds: SQL[] = [];
  if (q)
    conds.push(
      or(
        ilike(passages.title, `%${q}%`),
        ilike(passages.summary, `%${q}%`),
        ilike(passages.text, `%${q}%`),
        ilike(books.name, `%${q}%`)
      )!
    );
  if (Number.isFinite(bookId)) conds.push(eq(passages.bookId, bookId));
  if (testament) conds.push(eq(books.testament, testament));
  if (status) conds.push(eq(passages.status, status));
  if (themeSlug) {
    conds.push(
      inArray(
        passages.id,
        db
          .select({ id: passageThemes.passageId })
          .from(passageThemes)
          .innerJoin(themes, eq(themes.id, passageThemes.themeId))
          .where(eq(themes.slug, themeSlug))
      )
    );
  }

  const [rows, allBooks, allThemes] = await Promise.all([
    db
      .select({
        id: passages.id,
        title: passages.title,
        summary: passages.summary,
        status: passages.status,
        chapterStart: passages.chapterStart,
        verseStart: passages.verseStart,
        chapterEnd: passages.chapterEnd,
        verseEnd: passages.verseEnd,
        updatedAt: passages.updatedAt,
        bookName: books.name,
        bookAbbr: books.abbreviation,
        testament: books.testament,
        orderIndex: books.orderIndex,
        noteCount: sql<number>`(select count(*) from ${notes} where ${notes.passageId} = ${passages.id})::int`,
      })
      .from(passages)
      .innerJoin(books, eq(books.id, passages.bookId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(books.orderIndex, passages.chapterStart, passages.verseStart),
    db.select().from(books).orderBy(books.orderIndex),
    db.select().from(themes).orderBy(themes.name),
  ]);

  const passageIds = rows.map((r) => r.id);
  const themeRows = passageIds.length
    ? await db
        .select({
          passageId: passageThemes.passageId,
          name: themes.name,
          slug: themes.slug,
          color: themes.color,
          id: themes.id,
        })
        .from(passageThemes)
        .innerJoin(themes, eq(themes.id, passageThemes.themeId))
        .where(inArray(passageThemes.passageId, passageIds))
    : [];
  const themesByPassage = new Map<number, typeof themeRows>();
  for (const t of themeRows) {
    const arr = themesByPassage.get(t.passageId) ?? [];
    arr.push(t);
    themesByPassage.set(t.passageId, arr);
  }

  const hasFilters = Boolean(q || testament || status || themeSlug || Number.isFinite(bookId));

  return (
    <div>
      <PageHeader
        eyebrow="Studies"
        title="Passage Studies"
        description="Each study is a pericope with layered exegetical notes, word studies, cross-references, and citations."
        actions={
          <Link href="/passages/new" className="btn btn-primary">
            + New passage study
          </Link>
        }
      />

      <form className="card mb-6 grid gap-3 p-4 md:grid-cols-6" method="get">
        <div className="md:col-span-2">
          <label className="label">Search</label>
          <input name="q" defaultValue={q} className="input" placeholder="Title, summary, text…" />
        </div>
        <div>
          <label className="label">Testament</label>
          <select name="testament" defaultValue={testament ?? ""} className="input">
            <option value="">All</option>
            <option value="OT">Old Testament</option>
            <option value="NT">New Testament</option>
          </select>
        </div>
        <div>
          <label className="label">Book</label>
          <select name="book" defaultValue={Number.isFinite(bookId) ? String(bookId) : ""} className="input">
            <option value="">All books</option>
            {allBooks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status ?? ""} className="input">
            <option value="">Any</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Theme</label>
          <select name="theme" defaultValue={themeSlug ?? ""} className="input">
            <option value="">Any</option>
            {allThemes.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 md:col-span-6">
          <button className="btn btn-primary" type="submit">
            Filter
          </button>
          {hasFilters && (
            <Link href="/passages" className="btn btn-secondary">
              Clear
            </Link>
          )}
          <span className="ml-auto self-center text-xs text-ink-700/70">
            {rows.length} {rows.length === 1 ? "study" : "studies"}
          </span>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No studies match"
          description={hasFilters ? "Try loosening the filters." : "Begin by creating your first passage study."}
          action={
            <Link href="/passages/new" className="btn btn-primary">
              + New passage study
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-parchment-200">
          {rows.map((p) => (
            <Link
              key={p.id}
              href={`/passages/${p.id}`}
              className="group flex flex-col gap-2 p-4 transition-colors hover:bg-parchment-100 md:flex-row md:items-center md:gap-6"
            >
              <div className="w-36 shrink-0">
                <div className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  {p.testament}
                </div>
                <div className="font-serif text-base font-semibold text-oxblood-700">
                  {formatReference(
                    { name: p.bookName },
                    p.chapterStart,
                    p.verseStart,
                    p.chapterEnd,
                    p.verseEnd
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-serif text-lg font-semibold text-ink-900 group-hover:text-oxblood-700">
                  {p.title}
                </div>
                {p.summary && <p className="line-clamp-1 text-sm text-ink-700">{p.summary}</p>}
                <div className="mt-1 flex flex-wrap gap-1">
                  {(themesByPassage.get(p.id) ?? []).map((t) => (
                    <ThemeChip key={t.id} theme={t} link={false} />
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-ink-700/70">
                <span>{p.noteCount} notes</span>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
