import { db } from "@/db";
import { passages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatReference } from "@/lib/exegesis";

export const dynamic = "force-dynamic";

/** Read-only JSON export of the knowledge base's passage studies. */
export async function GET() {
  const rows = await db.query.passages.findMany({
    orderBy: [desc(passages.updatedAt)],
    with: {
      book: true,
      notes: true,
      wordStudies: true,
      crossReferences: true,
      passageThemes: { with: { theme: true } },
      passageSources: { with: { source: true } },
    },
  });
  return Response.json({
    count: rows.length,
    passages: rows.map((p) => ({
      id: p.id,
      reference: formatReference(p.book, p.chapterStart, p.verseStart, p.chapterEnd, p.verseEnd),
      book: p.book.name,
      testament: p.book.testament,
      title: p.title,
      status: p.status,
      translation: p.translation,
      text: p.text,
      summary: p.summary,
      themes: p.passageThemes.map((t) => t.theme.name),
      notes: p.notes.map((n) => ({ type: n.type, title: n.title, body: n.body })),
      wordStudies: p.wordStudies.map((w) => ({
        lemma: w.lemma,
        transliteration: w.transliteration,
        language: w.language,
        strongs: w.strongs,
        gloss: w.gloss,
        semanticRange: w.semanticRange,
        notes: w.notes,
      })),
      crossReferences: p.crossReferences.map((x) => ({ reference: x.reference, type: x.type, note: x.note })),
      sources: p.passageSources.map((s) => ({
        author: s.source.author,
        title: s.source.title,
        pages: s.pages,
        note: s.note,
      })),
      updatedAt: p.updatedAt,
    })),
  });
}
