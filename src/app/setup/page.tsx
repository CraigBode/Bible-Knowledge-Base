import Link from "next/link";
import { db } from "@/db";
import {
  books,
  passages,
  notes,
  wordStudies,
  crossReferences,
  themes,
  sources,
  passageSources,
  passageThemes,
} from "@/db/schema";
import { count } from "drizzle-orm";
import { runSeed, runReset } from "@/lib/actions";
import { BOOKS, THEMES, SOURCES, PASSAGES } from "@/db/seed-data";
import { EXEGETICAL_STEPS, XREF_TYPES } from "@/lib/exegesis";
import { PageHeader, SectionTitle } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const [[b], [p], [n], [w], [x], [t], [s], [ps], [pt]] = await Promise.all([
    db.select({ n: count() }).from(books),
    db.select({ n: count() }).from(passages),
    db.select({ n: count() }).from(notes),
    db.select({ n: count() }).from(wordStudies),
    db.select({ n: count() }).from(crossReferences),
    db.select({ n: count() }).from(themes),
    db.select({ n: count() }).from(sources),
    db.select({ n: count() }).from(passageSources),
    db.select({ n: count() }).from(passageThemes),
  ]);

  const tables = [
    { name: "books", label: "Canon (books)", rows: b.n, seed: BOOKS.length, desc: "66 books with testament, genre, chapter count, original language." },
    { name: "themes", label: "Themes", rows: t.n, seed: THEMES.length, desc: "Biblical-theological threads used as tags." },
    { name: "sources", label: "Sources", rows: s.n, seed: SOURCES.length, desc: "Bibliography of commentaries, lexica, grammars." },
    { name: "passages", label: "Passage studies", rows: p.n, seed: PASSAGES.length, desc: "Pericopes under study, with text, thesis, and status." },
    { name: "notes", label: "Exegetical notes", rows: n.n, seed: PASSAGES.reduce((a, q) => a + q.notes.length, 0), desc: "Typed by exegetical step." },
    { name: "word_studies", label: "Word studies", rows: w.n, seed: PASSAGES.reduce((a, q) => a + q.words.length, 0), desc: "Hebrew / Aramaic / Greek lexical entries." },
    { name: "cross_references", label: "Cross-references", rows: x.n, seed: PASSAGES.reduce((a, q) => a + q.xrefs.length, 0), desc: "Typed intertextual links." },
    { name: "passage_themes", label: "Passage ↔ Theme", rows: pt.n, seed: PASSAGES.reduce((a, q) => a + q.themes.length, 0), desc: "Join table." },
    { name: "passage_sources", label: "Citations", rows: ps.n, seed: PASSAGES.reduce((a, q) => a + q.sources.length, 0), desc: "Passage ↔ Source with pages and note." },
  ];

  const canonReady = b.n >= 66;

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Knowledge Base Setup"
        description="Bootstrap the canon, starter themes, bibliography, and worked sample studies. Inspect the data model that structures every exegetical entry."
        actions={
          <Link href="/" className="btn btn-secondary">
            ← Dashboard
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Status */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold">Database status</h2>
              <span className={`chip ${canonReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {canonReady ? "Canon loaded" : "Canon missing"}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-parchment-300 text-left text-[11px] uppercase tracking-widest text-ink-700/70">
                  <th className="pb-2 font-semibold">Table</th>
                  <th className="pb-2 font-semibold">Purpose</th>
                  <th className="pb-2 text-right font-semibold">Rows</th>
                  <th className="pb-2 text-right font-semibold">Seed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200">
                {tables.map((r) => (
                  <tr key={r.name}>
                    <td className="py-2 pr-3">
                      <div className="font-medium text-ink-900">{r.label}</div>
                      <div className="font-mono text-[11px] text-ink-700/60">{r.name}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-ink-700">{r.desc}</td>
                    <td className="py-2 text-right font-serif text-base font-semibold text-oxblood-700">{r.rows}</td>
                    <td className="py-2 text-right text-xs text-ink-700/70">{r.seed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-serif text-lg font-semibold">Seed missing data</h3>
              <p className="mt-1 text-sm text-ink-700">
                Idempotent. Inserts the canon if absent, adds any starter themes/sources not yet present, and
                creates sample studies that don&apos;t already exist. Your own content is untouched.
              </p>
              <form action={runSeed} className="mt-4">
                <button type="submit" className="btn btn-primary">
                  Run seed
                </button>
              </form>
            </div>
            <div className="card border-red-200 p-5">
              <h3 className="font-serif text-lg font-semibold text-red-800">Reset knowledge base</h3>
              <p className="mt-1 text-sm text-ink-700">
                Truncates <em>every</em> table — including your own studies — and re-seeds from scratch. Use to
                return to a pristine starting state.
              </p>
              <form action={runReset} className="mt-4">
                <ConfirmButton
                  className="btn btn-secondary !border-red-300 !text-red-800 hover:!bg-red-50"
                  message="This will permanently delete ALL studies, notes, word studies, themes, and sources, then re-seed. Continue?"
                >
                  Reset &amp; re-seed
                </ConfirmButton>
              </form>
            </div>
          </div>

          {/* Data model */}
          <div>
            <SectionTitle>Data model</SectionTitle>
            <div className="card p-5">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-ink-700">
{`books ─────────┐
               │ 1:N
               ▼
           passages ──── passage_themes ──── themes
           │  │  │  └─── passage_sources ─── sources
           │  │  └────── cross_references   (typed: ${XREF_TYPES.map((x) => x.value).join(" | ")})
           │  └───────── word_studies       (hebrew | aramaic | greek; may be standalone)
           └──────────── notes              (typed by exegetical step, 1–8)`}
              </pre>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <div className="font-semibold text-ink-900">Unit of study</div>
                  <p className="text-xs text-ink-700">
                    A <em>passage</em> is a pericope defined by book + chapter:verse range. Everything else hangs
                    off it. Passages carry a working translation text, a one-sentence thesis, and a status.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-ink-900">Typed notes</div>
                  <p className="text-xs text-ink-700">
                    Notes are typed by the step of the exegetical method they belong to, so a study can be
                    read as a workflow (observe → apply) and gaps become visible.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-ink-900">Lexical layer</div>
                  <p className="text-xs text-ink-700">
                    Word studies store lemma, transliteration, Strong&apos;s number, gloss, semantic range, and
                    contextual notes. They aggregate into a project-wide lexicon.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-ink-900">Canonical connections</div>
                  <p className="text-xs text-ink-700">
                    Cross-references are typed (quotation, allusion, typology…) and themes provide a
                    biblical-theological index across both testaments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Method reference */}
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">Exegetical method schema</h2>
            <ol className="space-y-3">
              {EXEGETICAL_STEPS.map((s) => (
                <li key={s.type} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-oxblood-700 font-serif text-xs font-bold text-amber-100">
                    {s.step}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">
                      {s.label}{" "}
                      <span className="font-mono text-[10px] font-normal text-ink-700/60">{s.type}</span>
                    </div>
                    <div className="text-xs italic text-oxblood-700">{s.question}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">Cross-reference types</h2>
            <ul className="space-y-1.5 text-sm">
              {XREF_TYPES.map((x) => (
                <li key={x.value} className="flex justify-between gap-3">
                  <span className="font-medium text-ink-900">{x.label}</span>
                  <span className="text-right text-xs text-ink-700">{x.hint}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 font-serif text-lg font-semibold">Sample studies included</h2>
            <ul className="space-y-1 text-sm text-ink-700">
              {PASSAGES.map((p) => (
                <li key={p.title}>
                  <span className="font-serif font-semibold text-oxblood-700">
                    {p.book} {p.chapterStart}:{p.verseStart}–{p.verseEnd}
                  </span>{" "}
                  <span className="text-xs">— {p.title}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-700/70">
              Scripture text from the World English Bible (public domain).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
