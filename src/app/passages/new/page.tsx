import Link from "next/link";
import { db } from "@/db";
import { books, themes } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { createPassage } from "@/lib/actions";
import { PageHeader } from "@/components/ui";
import { STATUS_META } from "@/lib/exegesis";

export const dynamic = "force-dynamic";

export default async function NewPassagePage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  await ensureSeeded();
  const sp = await searchParams;
  const [allBooks, allThemes] = await Promise.all([
    db.select().from(books).orderBy(books.orderIndex),
    db.select().from(themes).orderBy(themes.name),
  ]);
  const defaultBook = sp.book ?? String(allBooks[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="New"
        title="New Passage Study"
        description="Define the pericope. You will add notes, word studies, and cross-references on the study page."
        actions={
          <Link href="/passages" className="btn btn-secondary">
            Cancel
          </Link>
        }
      />

      <form action={createPassage} className="card space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="label">Book</label>
            <select name="bookId" defaultValue={defaultBook} className="input" required>
              <optgroup label="Old Testament">
                {allBooks
                  .filter((b) => b.testament === "OT")
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="New Testament">
                {allBooks
                  .filter((b) => b.testament === "NT")
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="label">Chapter</label>
            <input name="chapterStart" type="number" min={1} defaultValue={1} className="input" required />
          </div>
          <div>
            <label className="label">Verse</label>
            <input name="verseStart" type="number" min={1} defaultValue={1} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">To ch.</label>
              <input name="chapterEnd" type="number" min={1} defaultValue={1} className="input" />
            </div>
            <div>
              <label className="label">To v.</label>
              <input name="verseEnd" type="number" min={1} defaultValue={1} className="input" />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Study title</label>
          <input
            name="title"
            className="input"
            placeholder="e.g. The Prologue: The Word Was God"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Translation</label>
            <input name="translation" className="input" defaultValue="WEB" placeholder="WEB, ESV, NASB…" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" defaultValue="draft">
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Passage text</label>
          <textarea
            name="text"
            rows={5}
            className="input font-serif"
            placeholder="Paste the passage text in your working translation…"
          />
        </div>

        <div>
          <label className="label">Summary / thesis (one or two sentences)</label>
          <textarea
            name="summary"
            rows={2}
            className="input"
            placeholder="What is the passage's main point, in your own words?"
          />
        </div>

        <div>
          <label className="label">Themes</label>
          <div className="flex flex-wrap gap-2">
            {allThemes.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-parchment-300 bg-white px-3 py-1 text-xs text-ink-700 has-[:checked]:border-oxblood-700 has-[:checked]:bg-oxblood-700 has-[:checked]:text-white"
              >
                <input type="checkbox" name="themeIds" value={t.id} className="sr-only" />
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-parchment-200 pt-4">
          <Link href="/passages" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Create study
          </button>
        </div>
      </form>
    </div>
  );
}
