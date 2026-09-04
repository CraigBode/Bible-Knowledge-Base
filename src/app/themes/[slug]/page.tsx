import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { themes, passageThemes, passages, books, notes } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { formatReference } from "@/lib/exegesis";
import { PageHeader, StatusBadge, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = await db.query.themes.findFirst({ where: eq(themes.slug, slug) });
  if (!theme) notFound();

  const rows = await db
    .select({
      id: passages.id,
      title: passages.title,
      summary: passages.summary,
      status: passages.status,
      cs: passages.chapterStart,
      vs: passages.verseStart,
      ce: passages.chapterEnd,
      ve: passages.verseEnd,
      bookName: books.name,
      testament: books.testament,
      orderIndex: books.orderIndex,
    })
    .from(passageThemes)
    .innerJoin(passages, eq(passages.id, passageThemes.passageId))
    .innerJoin(books, eq(books.id, passages.bookId))
    .where(eq(passageThemes.themeId, theme.id))
    .orderBy(books.orderIndex, passages.chapterStart, passages.verseStart);

  // Pull theological notes from these passages for a synthesized view
  const ids = rows.map((r) => r.id);
  const theologyNotes = ids.length
    ? await db
        .select()
        .from(notes)
        .where(and(inArray(notes.passageId, ids), eq(notes.type, "theology")))
    : [];
  const byPassage = new Map<number, typeof theologyNotes>();
  for (const n of theologyNotes) {
    const arr = byPassage.get(n.passageId) ?? [];
    arr.push(n);
    byPassage.set(n.passageId, arr);
  }

  const ot = rows.filter((r) => r.testament === "OT");
  const nt = rows.filter((r) => r.testament === "NT");

  return (
    <div>
      <div className="mb-4 text-xs text-ink-700/70">
        <Link href="/themes" className="hover:text-oxblood-700">
          Themes
        </Link>{" "}
        / {theme.name}
      </div>
      <PageHeader
        eyebrow="Theme trace"
        title={theme.name}
        description={theme.description || undefined}
        actions={
          <Link href={`/passages?theme=${theme.slug}`} className="btn btn-secondary">
            Filter studies
          </Link>
        }
      />

      <div className="mb-6 h-1.5 w-full rounded-full" style={{ backgroundColor: theme.color }} />

      {rows.length === 0 ? (
        <EmptyState
          title="No studies tagged yet"
          description="Open a passage study and toggle this theme in the sidebar to begin tracing it."
          action={
            <Link href="/passages" className="btn btn-primary">
              Browse studies
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { label: "Old Testament", items: ot },
            { label: "New Testament", items: nt },
          ].map((col) => (
            <div key={col.label}>
              <h2 className="mb-3 font-serif text-xl font-semibold">
                {col.label}{" "}
                <span className="text-sm font-normal text-ink-700/70">({col.items.length})</span>
              </h2>
              {col.items.length === 0 ? (
                <div className="card p-4 text-sm text-ink-700/70">Not yet traced in this testament.</div>
              ) : (
                <div className="relative space-y-3 border-l-2 pl-5" style={{ borderColor: `${theme.color}66` }}>
                  {col.items.map((p) => (
                    <div key={p.id} className="relative">
                      <span
                        className="absolute -left-[27px] top-4 h-3 w-3 rounded-full border-2 border-parchment-50"
                        style={{ backgroundColor: theme.color }}
                      />
                      <Link href={`/passages/${p.id}`} className="card block p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-serif font-semibold text-oxblood-700">
                            {formatReference({ name: p.bookName }, p.cs, p.vs, p.ce, p.ve)}
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="font-serif text-lg text-ink-900">{p.title}</div>
                        {p.summary && <p className="mt-1 text-sm text-ink-700">{p.summary}</p>}
                        {(byPassage.get(p.id) ?? []).slice(0, 1).map((n) => (
                          <div key={n.id} className="mt-2 border-l-2 border-gold-500 pl-2 text-xs text-ink-700">
                            <span className="font-semibold">{n.title || "Theology"}: </span>
                            <span className="line-clamp-2">{n.body}</span>
                          </div>
                        ))}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
