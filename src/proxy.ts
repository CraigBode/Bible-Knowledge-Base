import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return new NextResponse(
      "This app requires an APP_PASSWORD environment variable to be set before it can run. Add it in your hosting provider's project settings, then redeploy.",
      { status: 500 }
    );
  }

  const expected = await sha256Hex(appPassword);
  const cookie = req.cookies.get("kb_session")?.value;
  if (cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}
