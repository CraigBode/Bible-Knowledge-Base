import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  books,
  themes,
  sources,
  passages,
  notes,
  wordStudies,
  passageThemes,
  crossReferences,
  passageSources,
} from "@/db/schema";
import { BOOKS, THEMES, SOURCES, PASSAGES } from "@/db/seed-data";
import { SCHEMA_INIT_SQL } from "@/db/schema-init";

/**
 * Creates every table/enum/index/foreign key if it doesn't already exist.
 * Safe to call on every cold start against a brand-new, empty database (e.g.
 * a freshly provisioned Neon/Supabase project) so there is no separate
 * migration step to run by hand before first use.
 */
let schemaReady: Promise<void> | null = null;
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = db.execute(sql.raw(SCHEMA_INIT_SQL)).then(() => undefined);
  }
  return schemaReady;
}

export async function seedCanon() {
  const existing = await db.select({ id: books.id }).from(books).limit(1);
  if (existing.length > 0) return { inserted: 0 };
  await db.insert(books).values(
    BOOKS.map((b, i) => ({ ...b, orderIndex: i + 1 }))
  );
  return { inserted: BOOKS.length };
}

export async function seedThemes() {
  const inserted = await db
    .insert(themes)
    .values(THEMES)
    .onConflictDoNothing({ target: themes.slug })
    .returning({ id: themes.id });
  return { inserted: inserted.length };
}

export async function seedSources() {
  const existing = await db.select({ title: sources.title }).from(sources);
  const have = new Set(existing.map((s) => s.title));
  const toInsert = SOURCES.filter((s) => !have.has(s.title));
  if (toInsert.length) await db.insert(sources).values(toInsert);
  return { inserted: toInsert.length };
}

export async function seedSamplePassages() {
  const allBooks = await db.select().from(books);
  const allThemes = await db.select().from(themes);
  const allSources = await db.select().from(sources);
  const bookByName = new Map(allBooks.map((b) => [b.name, b]));
  const themeBySlug = new Map(allThemes.map((t) => [t.slug, t]));
  const sourceByTitle = new Map(allSources.map((s) => [s.title, s]));

  let inserted = 0;
  for (const p of PASSAGES) {
    const book = bookByName.get(p.book);
    if (!book) continue;
    const dup = await db
      .select({ id: passages.id })
      .from(passages)
      .where(
        sql`${passages.bookId} = ${book.id} and ${passages.chapterStart} = ${p.chapterStart} and ${passages.verseStart} = ${p.verseStart} and ${passages.chapterEnd} = ${p.chapterEnd} and ${passages.verseEnd} = ${p.verseEnd}`
      )
      .limit(1);
    if (dup.length) continue;

    const [created] = await db
      .insert(passages)
      .values({
        bookId: book.id,
        chapterStart: p.chapterStart,
        verseStart: p.verseStart,
        chapterEnd: p.chapterEnd,
        verseEnd: p.verseEnd,
        title: p.title,
        translation: p.translation,
        text: p.text,
        summary: p.summary,
        status: p.status,
      })
      .returning();

    if (p.notes.length)
      await db
        .insert(notes)
        .values(p.notes.map((n) => ({ ...n, passageId: created.id })));
    if (p.words.length)
      await db
        .insert(wordStudies)
        .values(p.words.map((w) => ({ ...w, passageId: created.id })));
    if (p.xrefs.length)
      await db
        .insert(crossReferences)
        .values(p.xrefs.map((x) => ({ ...x, passageId: created.id })));
    const themeRows = p.themes
      .map((slug) => themeBySlug.get(slug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => ({ passageId: created.id, themeId: t.id }));
    if (themeRows.length) await db.insert(passageThemes).values(themeRows);
    const sourceRows = p.sources
      .map((s) => {
        const src = sourceByTitle.get(s.title);
        return src
          ? { passageId: created.id, sourceId: src.id, pages: s.pages, note: s.note }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
    if (sourceRows.length) await db.insert(passageSources).values(sourceRows);
    inserted++;
  }
  return { inserted };
}

/** Full bootstrap: canon + themes + sources + sample studies. */
export async function seedAll() {
  const canon = await seedCanon();
  const th = await seedThemes();
  const src = await seedSources();
  const ps = await seedSamplePassages();
  return { books: canon.inserted, themes: th.inserted, sources: src.inserted, passages: ps.inserted };
}

/** Called by pages on first load so the schema exists and the canon is always available. */
export async function ensureSeeded() {
  await ensureSchema();
  const existing = await db.select({ id: books.id }).from(books).limit(1);
  if (existing.length === 0) {
    await seedAll();
  }
}

/** Wipe all user content (keeps nothing) and re-seed from scratch. */
export async function resetKnowledgeBase() {
  await db.execute(
    sql`truncate table passage_sources, passage_themes, cross_references, word_studies, notes, passages, sources, themes, books restart identity cascade`
  );
  return seedAll();
}
