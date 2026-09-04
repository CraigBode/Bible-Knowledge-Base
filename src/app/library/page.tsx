import Link from "next/link";
import { db } from "@/db";
import { sources, passageSources } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import { createSource, deleteSource } from "@/lib/actions";
import { SOURCE_TYPES, titleCase } from "@/lib/exegesis";
import { PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await ensureSeeded();
  const sp = await searchParams;
  const typeFilter = sp.type && (SOURCE_TYPES as string[]).includes(sp.type) ? sp.type : undefined;

  const rows = await db
    .select({
      s: sources,
      cited: count(passageSources.id),
    })
    .from(sources)
    .leftJoin(passageSources, eq(passageSources.sourceId, sources.id))
    .groupBy(sources.id)
    .orderBy(sources.type, sources.author);

  const filtered = typeFilter ? rows.filter((r) => r.s.type === typeFilter) : rows;
  const typeCounts = new Map<string, number>();
  for (const r of rows) typeCounts.set(r.s.type, (typeCounts.get(r.s.type) ?? 0) + 1);

  return (
    <div>
      <PageHeader
        eyebrow="Bibliography"
        title="Library"
        description="Commentaries, lexica, grammars, and monographs you consult. Cite them from any passage study."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-1.5">
            <Link
              href="/library"
              className={`chip ${!typeFilter ? "bg-oxblood-700 text-white" : "bg-parchment-200 text-ink-700 hover:bg-parchment-300"}`}
            >
              All <span className="opacity-60">{rows.length}</span>
            </Link>
            {SOURCE_TYPES.map((t) => (
              <Link
                key={t}
                href={`/library?type=${t}`}
                className={`chip ${typeFilter === t ? "bg-oxblood-700 text-white" : "bg-parchment-200 text-ink-700 hover:bg-parchment-300"}`}
              >
                {titleCase(t)} <span className="opacity-60">{typeCounts.get(t) ?? 0}</span>
              </Link>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card p-6 text-sm text-ink-700">No sources in this category.</div>
          ) : (
            <div className="card divide-y divide-parchment-200">
              {filtered.map(({ s, cited }) => (
                <div key={s.id} className="group flex items-start gap-4 p-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-parchment-200 font-serif text-lg text-oxblood-700">
                    {s.type === "lexicon" ? "α" : s.type === "grammar" ? "§" : s.type === "commentary" ? "¶" : "▤"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900">{s.author}</div>
                    <div className="font-serif italic text-ink-700">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-oxblood-700 hover:underline">
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-ink-700/70">
                      <span className="chip bg-parchment-200 text-ink-700">{titleCase(s.type)}</span>
                      {s.publisher && <span>{s.publisher}</span>}
                      {s.year && <span>{s.year}</span>}
                      <span>
                        Cited in {cited} {cited === 1 ? "study" : "studies"}
                      </span>
                    </div>
                  </div>
                  <form action={deleteSource} className="opacity-0 transition-opacity group-hover:opacity-100">
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message="Delete this source and all its citations?">Delete</ConfirmButton>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card h-fit p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">Add source</h2>
          <form action={createSource} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input name="title" className="input" required />
            </div>
            <div>
              <label className="label">Author(s)</label>
              <input name="author" className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Type</label>
                <select name="type" className="input" defaultValue="commentary">
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {titleCase(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input name="year" type="number" min={1} max={2100} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Publisher</label>
              <input name="publisher" className="input" />
            </div>
            <div>
              <label className="label">URL</label>
              <input name="url" type="url" className="input" placeholder="https://" />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">
              Add to library
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
