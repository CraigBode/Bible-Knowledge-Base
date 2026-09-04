import { login } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next || "/";
  const hasError = sp.error === "1";

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-oxblood-700 font-serif text-xl font-bold text-amber-100 shadow">
            Λ
          </div>
          <div>
            <div className="font-serif text-lg font-semibold leading-tight text-ink-900">
              Exegesis KB
            </div>
            <div className="text-[11px] uppercase tracking-widest text-ink-700/70">
              Ad fontes
            </div>
          </div>
        </div>

        <form action={login} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              autoFocus
              required
              placeholder="Enter password"
            />
          </div>
          {hasError && (
            <p className="text-sm text-red-700">That password isn&apos;t right. Try again.</p>
          )}
          <button type="submit" className="btn btn-primary w-full justify-center">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
