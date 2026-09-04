"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function login(formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";
  const next = formData.get("next")?.toString() || "/";
  const expected = process.env.APP_PASSWORD;

  if (!expected || password !== expected) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const store = await cookies();
  store.set("kb_session", await sha256Hex(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  redirect(next);
}

export async function logout() {
  const store = await cookies();
  store.delete("kb_session");
  redirect("/login");
}
