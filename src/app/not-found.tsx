import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="font-serif text-6xl text-parchment-300">¶</div>
      <h1 className="mt-2 font-serif text-2xl font-semibold">Not found</h1>
      <p className="mt-1 text-sm text-ink-700">That page or study does not exist.</p>
      <Link href="/" className="btn btn-primary mt-4">
        Back to dashboard
      </Link>
    </div>
  );
}
