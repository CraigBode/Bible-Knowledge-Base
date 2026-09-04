import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { passages, themes, sources, notes as notesTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import {
  addNote,
  deleteNote,
  addWordStudy,
  deleteWordStudy,
  addCrossReference,
  deleteCrossReference,
  togglePassageTheme,
  citeSource,
  removeCitation,
  updatePassage,
  setPassageStatus,
  deletePassage,
} from "@/lib/actions";
import {
  formatReference,
  NOTE_TYPES,
  STATUS_META,
  XREF_TYPES,
  LANG_META,
  type Lang,
} from "@/lib/exegesis";
import {
  PageHeader,
  StatusBadge,
  ThemeChip,
  XrefBadge,
  LangBadge,
  SectionTitle,
} from "@/components/ui";
import { NotesWorkbench } from "@/components/notes-workbench";
import { ConfirmButton } from "@/components/confirm-button";

export const dynamic = "force-dynamic";

export default async function PassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) notFound();

  await ensureSeeded();
  const passage = await db.query.passages.findFirst({
    where: eq(passages.id, id),
    with: {
      book: true,
      notes: { orderBy: [asc(notesTable.createdAt)] },
      wordStudies: true,
      crossReferences: true,
      passageThemes: { with: { theme: true } },
      passageSources: { with: { source: true } },
    },
  });
  if (!passage) notFound();

  const [allThemes, allSources] = await Promise.all([
    db.select().from(themes).orderBy(themes.name),
    db.select().from(sources).orderBy(sources.author),
  ]);

  const ref = formatReference(
    passage.book,
    passage.chapterStart,
    passage.verseStart,
    passage.chapterEnd,
    passage.verseEnd
  );
  const attachedThemeIds = new Set(passage.passageThemes.map((pt) => pt.themeId));
  const sortedNotes = [...passage.notes].sort(
    (a, b) => NOTE_TYPES.indexOf(a.type) - NOTE_TYPES.indexOf(b.type)
  );
  const defaultLang: Lang = passage.book.language;
  const citedSourceIds = new Set(passage.passageSources.map((ps) => ps.sourceId));

  return (
    <div>
      <div className="mb-4 text-xs text-ink-700/70">
        <Link href="/passages" className="hover:text-oxblood-700">
          Passage studies
        </Link>{" "}
        / <span>{ref}</span>
      </div>

      <PageHeader
        eyebrow={`${passage.book.testament === "OT" ? "Old Testament" : "New Testament"} · ${passage.book.genre} · ${passage.translation}`}
        title={passage.title}
        actions={
          <>
            <form action={setPassageStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={passage.id} />
              <select
                name="status"
                defaultValue={passage.status}
                className="input !w-auto"
              >
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button className="btn btn-secondary" type="submit">
                Update
              </button>
            </form>
            <form action={deletePassage}>
              <input type="hidden" name="id" value={passage.id} />
              <ConfirmButton
                className="btn btn-secondary !text-red-700"
                message="Delete this study and all of its notes, word studies, and references?"
              >
                Delete
              </ConfirmButton>
            </form>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left / main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Scripture text */}
          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-serif text-2xl font-semibold text-oxblood-700">{ref}</div>
              <StatusBadge status={passage.status} />
            </div>
            {passage.text ? (
              <p className="scripture">{passage.text}</p>
            ) : (
              <p className="text-sm italic text-ink-700/70">
                No passage text recorded yet — add it under “Edit study details”.
              </p>
            )}
            {passage.summary && (
              <div className="mt-5 border-l-4 border-gold-500 bg-parchment-100 px-4 py-3">
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-gold-500">
                  Thesis
                </div>
                <p className="text-sm leading-relaxed text-ink-900">{passage.summary}</p>
              </div>
            )}

            <details className="mt-5">
              <summary className="text-sm font-medium text-oxblood-700 hover:underline">
                Edit study details
              </summary>
              <form action={updatePassage} className="mt-3 space-y-3 border-t border-parchment-200 pt-4">
                <input type="hidden" name="id" value={passage.id} />
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="label">Title</label>
                    <input name="title" defaultValue={passage.title} className="input" required />
                  </div>
                  <div>
                    <label className="label">Translation</label>
                    <input name="translation" defaultValue={passage.translation} className="input" />
                  </div>
                </div>
                <input type="hidden" name="status" value={passage.status} />
                <div>
                  <label className="label">Passage text</label>
                  <textarea name="text" rows={5} defaultValue={passage.text} className="input font-serif" />
                </div>
                <div>
                  <label className="label">Summary / thesis</label>
                  <textarea name="summary" rows={2} defaultValue={passage.summary} className="input" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </form>
            </details>
          </div>

          {/* Notes workbench */}
          <div>
            <SectionTitle count={passage.notes.length}>Exegetical notes</SectionTitle>
            <NotesWorkbench
              passageId={passage.id}
              notes={sortedNotes}
              addNote={addNote}
              deleteNote={deleteNote}
            />
          </div>

          {/* Word studies */}
          <div>
            <SectionTitle count={passage.wordStudies.length}>Word studies</SectionTitle>
            <div className="card">
              {passage.wordStudies.length === 0 ? (
                <div className="p-6 text-center text-sm text-ink-700/70">
                  No word studies yet. Add key terms from the original language below.
                </div>
              ) : (
                <ul className="divide-y divide-parchment-200">
                  {passage.wordStudies.map((w) => (
                    <li key={w.id} className="group p-4">
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
                            <span className="text-xs text-ink-700/70">{w.occurrences}× in corpus</span>
                          )}
                        </div>
                        <form action={deleteWordStudy} className="opacity-0 transition-opacity group-hover:opacity-100">
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="passageId" value={passage.id} />
                          <ConfirmButton message="Delete this word study?">Delete</ConfirmButton>
                        </form>
                      </div>
                      <div className="mt-1 font-serif text-base font-semibold text-oxblood-700">{w.gloss}</div>
                      {w.semanticRange && (
                        <p className="mt-1 text-sm text-ink-700">
                          <span className="font-semibold text-ink-900">Semantic range: </span>
                          {w.semanticRange}
                        </p>
                      )}
                      {w.notes && <p className="prose-note mt-1">{w.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <details className="border-t border-parchment-200">
                <summary className="px-4 py-3 text-sm font-medium text-oxblood-700 hover:underline">
                  + Add word study
                </summary>
                <form action={addWordStudy} className="space-y-3 bg-parchment-50 p-4">
                  <input type="hidden" name="passageId" value={passage.id} />
                  <div className="grid gap-3 md:grid-cols-4">
                    <div>
                      <label className="label">Lemma</label>
                      <input name="lemma" className="input font-original" placeholder="λόγος / דָּבָר" required />
                    </div>
                    <div>
                      <label className="label">Transliteration</label>
                      <input name="transliteration" className="input" placeholder="logos" />
                    </div>
                    <div>
                      <label className="label">Language</label>
                      <select name="language" defaultValue={defaultLang} className="input">
                        {(Object.keys(LANG_META) as Lang[]).map((l) => (
                          <option key={l} value={l}>
                            {LANG_META[l].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Strong&apos;s</label>
                        <input name="strongs" className="input" placeholder="G3056" />
                      </div>
                      <div>
                        <label className="label">Occurr.</label>
                        <input name="occurrences" type="number" min={0} className="input" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="label">Gloss</label>
                    <input name="gloss" className="input" placeholder="word, message, reason" required />
                  </div>
                  <div>
                    <label className="label">Semantic range</label>
                    <textarea name="semanticRange" rows={2} className="input" placeholder="Range of meaning with representative references…" />
                  </div>
                  <div>
                    <label className="label">Notes on usage here</label>
                    <textarea name="notes" rows={3} className="input" placeholder="How context selects the sense in this passage…" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      Save word study
                    </button>
                  </div>
                </form>
              </details>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Themes */}
          <div className="card p-4">
            <SectionTitle count={passage.passageThemes.length}>Themes</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {allThemes.map((t) => {
                const attached = attachedThemeIds.has(t.id);
                return (
                  <form key={t.id} action={togglePassageTheme}>
                    <input type="hidden" name="passageId" value={passage.id} />
                    <input type="hidden" name="themeId" value={t.id} />
                    <input type="hidden" name="attached" value={attached ? "1" : "0"} />
                    <button
                      type="submit"
                      title={attached ? "Remove theme" : "Add theme"}
                      className="chip border transition-opacity hover:opacity-80"
                      style={
                        attached
                          ? { backgroundColor: t.color, color: "#fff", borderColor: t.color }
                          : { backgroundColor: "transparent", color: t.color, borderColor: `${t.color}66` }
                      }
                    >
                      {attached ? "✓ " : "+ "}
                      {t.name}
                    </button>
                  </form>
                );
              })}
            </div>
            {passage.passageThemes.length > 0 && (
              <div className="mt-3 border-t border-parchment-200 pt-3 text-xs text-ink-700/70">
                Browse:{" "}
                {passage.passageThemes.map((pt, i) => (
                  <span key={pt.themeId}>
                    {i > 0 && ", "}
                    <Link href={`/themes/${pt.theme.slug}`} className="text-oxblood-700 hover:underline">
                      {pt.theme.name}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cross references */}
          <div className="card p-4">
            <SectionTitle count={passage.crossReferences.length}>Cross-references</SectionTitle>
            {passage.crossReferences.length === 0 ? (
              <p className="text-sm text-ink-700/70">None yet.</p>
            ) : (
              <ul className="space-y-3">
                {passage.crossReferences.map((x) => (
                  <li key={x.id} className="group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/passages?q=${encodeURIComponent(x.reference.split(" ").slice(0, -1).join(" ") || x.reference)}`}
                          className="font-serif font-semibold text-oxblood-700 hover:underline"
                        >
                          {x.reference}
                        </Link>
                        <XrefBadge type={x.type} />
                      </div>
                      <form action={deleteCrossReference} className="opacity-0 group-hover:opacity-100">
                        <input type="hidden" name="id" value={x.id} />
                        <input type="hidden" name="passageId" value={passage.id} />
                        <ConfirmButton message="Remove this cross-reference?">×</ConfirmButton>
                      </form>
                    </div>
                    {x.note && <p className="mt-0.5 text-sm text-ink-700">{x.note}</p>}
                  </li>
                ))}
              </ul>
            )}
            <details className="mt-3 border-t border-parchment-200 pt-3">
              <summary className="text-sm font-medium text-oxblood-700 hover:underline">+ Add cross-reference</summary>
              <form action={addCrossReference} className="mt-3 space-y-2">
                <input type="hidden" name="passageId" value={passage.id} />
                <div>
                  <label className="label">Reference</label>
                  <input name="reference" className="input" placeholder="Colossians 1:15–17" required />
                </div>
                <div>
                  <label className="label">Relationship</label>
                  <select name="type" className="input" defaultValue="thematic">
                    {XREF_TYPES.map((x) => (
                      <option key={x.value} value={x.value}>
                        {x.label} — {x.hint}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Note</label>
                  <textarea name="note" rows={2} className="input" placeholder="Why this text is relevant…" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Add
                  </button>
                </div>
              </form>
            </details>
          </div>

          {/* Sources */}
          <div className="card p-4">
            <SectionTitle count={passage.passageSources.length}>Sources consulted</SectionTitle>
            {passage.passageSources.length === 0 ? (
              <p className="text-sm text-ink-700/70">No citations yet.</p>
            ) : (
              <ul className="space-y-3">
                {passage.passageSources.map((ps) => (
                  <li key={ps.id} className="group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{ps.source.author}</div>
                        <div className="text-sm italic text-ink-700">{ps.source.title}</div>
                        {ps.pages && <div className="text-xs text-ink-700/70">pp. {ps.pages}</div>}
                        {ps.note && <p className="mt-0.5 text-sm text-ink-700">{ps.note}</p>}
                      </div>
                      <form action={removeCitation} className="opacity-0 group-hover:opacity-100">
                        <input type="hidden" name="id" value={ps.id} />
                        <input type="hidden" name="passageId" value={passage.id} />
                        <ConfirmButton message="Remove this citation?">×</ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <details className="mt-3 border-t border-parchment-200 pt-3">
              <summary className="text-sm font-medium text-oxblood-700 hover:underline">+ Cite a source</summary>
              {allSources.length === 0 ? (
                <p className="mt-2 text-xs text-ink-700">
                  Your library is empty.{" "}
                  <Link href="/library" className="text-oxblood-700 underline">
                    Add sources
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <form action={citeSource} className="mt-3 space-y-2">
                  <input type="hidden" name="passageId" value={passage.id} />
                  <div>
                    <label className="label">Source</label>
                    <select name="sourceId" className="input" required>
                      {allSources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {citedSourceIds.has(s.id) ? "• " : ""}
                          {s.author} — {s.title.length > 50 ? s.title.slice(0, 50) + "…" : s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pages</label>
                    <input name="pages" className="input" placeholder="111–120" />
                  </div>
                  <div>
                    <label className="label">Note</label>
                    <textarea name="note" rows={2} className="input" placeholder="What this source contributes…" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      Cite
                    </button>
                  </div>
                </form>
              )}
            </details>
          </div>

          <div className="text-xs text-ink-700/60">
            Created {new Date(passage.createdAt).toLocaleDateString()} · Updated{" "}
            {new Date(passage.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
