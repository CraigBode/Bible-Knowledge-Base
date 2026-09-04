import Link from "next/link";
import { db } from "@/db";
import { wordStudies, passages, books } from "@/db/schema";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import { addWordStudy, deleteWordStudy } from "@/lib/actions";
import { formatReference, LANG_META, type Lang } from "@/lib/exegesis";
import { PageHeader, LangBadge, EmptyState } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";

export const dynamic = "force-dynamic";

export default async function LexiconPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  await ensureSeeded();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const lang = sp.lang && sp.lang in LANG_META ? (sp.lang as Lang) : undefined;

  const conds: SQL[] = [];
  if (q)
    conds.push(
      or(
        ilike(wordStudies.lemma, `%${q}%`),
        ilike(wordStudies.transliteration, `%${q}%`),
        ilike(wordStudies.gloss, `%${q}%`),
        ilike(wordStudies.strongs, `%${q}%`),
        ilike(wordStudies.semanticRange, `%${q}%`)
      )!
    );
  if (lang) conds.push(eq(wordStudies.language, lang));

  const rows = await db
    .select({
      w: wordStudies,
      passageId: passages.id,
      cs: passages.chapterStart,
      vs: passages.verseStart,
      ce: passages.chapterEnd,
      ve: passages.verseEnd,
      bookName: books.name,
    })
    .from(wordStudies)
    .leftJoin(passages, eq(passages.id, wordStudies.passageId))
    .leftJoin(books, eq(books.id, passages.bookId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(wordStudies.language, wordStudies.transliteration);

  const langCounts = { hebrew: 0, aramaic: 0, greek: 0 } as Record<Lang, number>;

  return (
    <div>
      <PageHeader
        eyebrow="Original languages"
        title="Lexicon"
        description="Every Hebrew, Aramaic, and Greek word study in the knowledge base, linked back to the passages where it was made."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <form method="get" className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="label">Search</label>
              <input name="q" defaultValue={q} className="input" placeholder="Lemma, transliteration, gloss, Strong's…" />
            </div>
            <div>
              <label className="label">Language</label>
              <select name="lang" defaultValue={lang ?? ""} className="input">
                <option value="">All</option>
                {(Object.keys(LANG_META) as Lang[]).map((l) => (
                  <option key={l} value={l}>
                    {LANG_META[l].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit">
                Search
              </button>
              {(q || lang) && (
                <Link href="/lexicon" className="btn btn-secondary">
                  Clear
                </Link>
              )}
            </div>
          </form>

          {rows.length === 0 ? (
            <EmptyState title="No word studies found" description="Add one using the form, or from within a passage study." />
          ) : (
            <div className="card divide-y divide-parchment-200">
              {rows.map(({ w, passageId, cs, vs, ce, ve, bookName }) => {
                langCounts[w.language]++;
                return (
                  <div key={w.id} className="group p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-original text-2xl text-ink-900" dir={LANG_META[w.language].dir}>
                          {w.lemma}
                        </span>
                        <span className="italic text-ink-700">{w.transliteration}</span>
                        <LangBadge lang={w.language} />
                        {w.strongs && (
                          <span className="rounded bg-parchment-200 px-1.5 py-0.5 font-mono text-[11px] text-ink-700">
                            {w.strongs}
                          </span>
                        )}
                        {typeof w.occurrences === "number" && (
                          <span className="text-xs text-ink-700/70">{w.occurrences}×</span>
                        )}
                      </div>
                      <form action={deleteWordStudy} className="opacity-0 transition-opacity group-hover:opacity-100">
                        <input type="hidden" name="id" value={w.id} />
                        <ConfirmButton message="Delete this word study?">Delete</ConfirmButton>
                      </form>
                    </div>
                    <div className="mt-1 font-serif font-semibold text-oxblood-700">{w.gloss}</div>
                    {w.semanticRange && <p className="mt-1 text-sm text-ink-700">{w.semanticRange}</p>}
                    {w.notes && <p className="prose-note mt-1">{w.notes}</p>}
                    <div className="mt-2 text-xs text-ink-700/70">
                      {passageId && bookName ? (
                        <>
                          Studied in{" "}
                          <Link href={`/passages/${passageId}`} className="text-oxblood-700 hover:underline">
                            {formatReference({ name: bookName }, cs!, vs!, ce!, ve!)}
                          </Link>
                        </>
                      ) : (
                        "Standalone entry"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="mb-3 font-serif text-lg font-semibold">Add a standalone entry</h2>
            <form action={addWordStudy} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Lemma</label>
                  <input name="lemma" className="input font-original" required />
                </div>
                <div>
                  <label className="label">Transliteration</label>
                  <input name="transliteration" className="input" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Language</label>
                  <select name="language" className="input" defaultValue="greek">
                    {(Object.keys(LANG_META) as Lang[]).map((l) => (
                      <option key={l} value={l}>
                        {LANG_META[l].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Strong&apos;s</label>
                  <input name="strongs" className="input" />
                </div>
                <div>
                  <label className="label">Occurr.</label>
                  <input name="occurrences" type="number" min={0} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Gloss</label>
                <input name="gloss" className="input" required />
              </div>
              <div>
                <label className="label">Semantic range</label>
                <textarea name="semanticRange" rows={2} className="input" />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea name="notes" rows={3} className="input" />
              </div>
              <button type="submit" className="btn btn-primary w-full justify-center">
                Save entry
              </button>
            </form>
          </div>

          <div className="card p-4 text-sm text-ink-700">
            <h3 className="mb-2 font-serif text-base font-semibold text-ink-900">Word-study discipline</h3>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed">
              <li>Meaning is determined by usage in context, not etymology (root fallacy).</li>
              <li>Do not import every sense of a word into one occurrence (illegitimate totality transfer).</li>
              <li>Check usage in the same author and corpus before the wider language.</li>
              <li>Consult the LXX for the Greek of the OT and for NT lexical background.</li>
              <li>Record the semantic range, then argue for the sense this context selects.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
