import Link from "next/link";
import { db } from "@/db";
import { themes, passageThemes } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import { createTheme, deleteTheme } from "@/lib/actions";
import { PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  await ensureSeeded();
  const rows = await db
    .select({
      id: themes.id,
      name: themes.name,
      slug: themes.slug,
      description: themes.description,
      color: themes.color,
      n: count(passageThemes.passageId),
    })
    .from(themes)
    .leftJoin(passageThemes, eq(passageThemes.themeId, themes.id))
    .groupBy(themes.id)
    .orderBy(desc(count(passageThemes.passageId)), themes.name);

  return (
    <div>
      <PageHeader
        eyebrow="Biblical theology"
        title="Themes"
        description="Canonical threads that tie passages together. Tag studies with themes to trace a motif across the whole of Scripture."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {rows.length === 0 ? (
            <div className="card p-6 text-sm text-ink-700">No themes yet.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((t) => (
                <div
                  key={t.id}
                  className="card group relative flex flex-col p-4"
                  style={{ borderTopColor: t.color, borderTopWidth: 3 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/themes/${t.slug}`} className="font-serif text-lg font-semibold text-ink-900 hover:text-oxblood-700">
                      {t.name}
                    </Link>
                    <span className="chip" style={{ backgroundColor: `${t.color}1a`, color: t.color }}>
                      {t.n} {t.n === 1 ? "study" : "studies"}
                    </span>
                  </div>
                  {t.description && <p className="mt-1 text-sm text-ink-700">{t.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <Link href={`/themes/${t.slug}`} className="text-xs text-oxblood-700 hover:underline">
                      Trace theme →
                    </Link>
                    <form action={deleteTheme} className="opacity-0 transition-opacity group-hover:opacity-100">
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton message={`Delete theme "${t.name}"? It will be detached from all studies.`}>
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card h-fit p-4">
          <h2 className="mb-3 font-serif text-lg font-semibold">New theme</h2>
          <form action={createTheme} className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input name="name" className="input" placeholder="e.g. Temple & Presence" required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" rows={3} className="input" placeholder="Scope of the theme across the canon…" />
            </div>
            <div>
              <label className="label">Color</label>
              <input name="color" type="color" defaultValue="#7c2d12" className="h-9 w-16 cursor-pointer rounded border border-parchment-300 bg-white p-0.5" />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">
              Create theme
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
