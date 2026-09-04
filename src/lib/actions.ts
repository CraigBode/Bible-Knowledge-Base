"use server";

import { db } from "@/db";
import {
  passages,
  notes,
  wordStudies,
  crossReferences,
  themes,
  passageThemes,
  sources,
  passageSources,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetKnowledgeBase, seedAll } from "@/db/seed";
import { slugify } from "@/lib/exegesis";
import type {
  NoteType,
  XrefType,
  StudyStatus,
  Lang,
  SourceType,
} from "@/lib/exegesis";

const str = (fd: FormData, k: string) => (fd.get(k)?.toString() ?? "").trim();
const num = (fd: FormData, k: string, fallback = 0) => {
  const n = parseInt(str(fd, k), 10);
  return Number.isFinite(n) ? n : fallback;
};
const optNum = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

function touchPassage(id: number) {
  return db.update(passages).set({ updatedAt: new Date() }).where(eq(passages.id, id));
}

function revalidateAll(passageId?: number) {
  revalidatePath("/");
  revalidatePath("/passages");
  revalidatePath("/lexicon");
  revalidatePath("/themes");
  revalidatePath("/library");
  revalidatePath("/setup");
  if (passageId) revalidatePath(`/passages/${passageId}`);
}

// ---------- Passages ----------
export async function createPassage(formData: FormData) {
  const bookId = num(formData, "bookId");
  const chapterStart = Math.max(1, num(formData, "chapterStart", 1));
  const verseStart = Math.max(1, num(formData, "verseStart", 1));
  const chapterEnd = Math.max(chapterStart, num(formData, "chapterEnd", chapterStart));
  const verseEnd =
    chapterEnd === chapterStart
      ? Math.max(verseStart, num(formData, "verseEnd", verseStart))
      : Math.max(1, num(formData, "verseEnd", 1));
  const title = str(formData, "title") || "Untitled study";
  if (!bookId) return;

  const [created] = await db
    .insert(passages)
    .values({
      bookId,
      chapterStart,
      verseStart,
      chapterEnd,
      verseEnd,
      title,
      translation: str(formData, "translation") || "WEB",
      text: str(formData, "text"),
      summary: str(formData, "summary"),
      status: (str(formData, "status") || "draft") as StudyStatus,
    })
    .returning({ id: passages.id });

  const themeIds = formData
    .getAll("themeIds")
    .map((v) => parseInt(v.toString(), 10))
    .filter((n) => Number.isFinite(n));
  if (themeIds.length)
    await db
      .insert(passageThemes)
      .values(themeIds.map((themeId) => ({ passageId: created.id, themeId })));

  revalidateAll(created.id);
  redirect(`/passages/${created.id}`);
}

export async function updatePassage(formData: FormData) {
  const id = num(formData, "id");
  if (!id) return;
  await db
    .update(passages)
    .set({
      title: str(formData, "title") || "Untitled study",
      translation: str(formData, "translation") || "WEB",
      text: str(formData, "text"),
      summary: str(formData, "summary"),
      status: (str(formData, "status") || "draft") as StudyStatus,
      updatedAt: new Date(),
    })
    .where(eq(passages.id, id));
  revalidateAll(id);
}

export async function setPassageStatus(formData: FormData) {
  const id = num(formData, "id");
  const status = str(formData, "status") as StudyStatus;
  if (!id || !status) return;
  await db
    .update(passages)
    .set({ status, updatedAt: new Date() })
    .where(eq(passages.id, id));
  revalidateAll(id);
}

export async function deletePassage(formData: FormData) {
  const id = num(formData, "id");
  if (!id) return;
  await db.delete(passages).where(eq(passages.id, id));
  revalidateAll();
  redirect("/passages");
}

// ---------- Notes ----------
export async function addNote(formData: FormData) {
  const passageId = num(formData, "passageId");
  const body = str(formData, "body");
  if (!passageId || !body) return;
  await db.insert(notes).values({
    passageId,
    type: (str(formData, "type") || "observation") as NoteType,
    title: str(formData, "title"),
    body,
  });
  await touchPassage(passageId);
  revalidateAll(passageId);
}

export async function deleteNote(formData: FormData) {
  const id = num(formData, "id");
  const passageId = num(formData, "passageId");
  if (!id) return;
  await db.delete(notes).where(eq(notes.id, id));
  revalidateAll(passageId);
}

// ---------- Word studies ----------
export async function addWordStudy(formData: FormData) {
  const lemma = str(formData, "lemma");
  const gloss = str(formData, "gloss");
  if (!lemma || !gloss) return;
  const passageId = optNum(formData, "passageId");
  await db.insert(wordStudies).values({
    passageId,
    lemma,
    transliteration: str(formData, "transliteration"),
    language: (str(formData, "language") || "greek") as Lang,
    strongs: str(formData, "strongs"),
    gloss,
    semanticRange: str(formData, "semanticRange"),
    occurrences: optNum(formData, "occurrences"),
    notes: str(formData, "notes"),
  });
  if (passageId) await touchPassage(passageId);
  revalidateAll(passageId ?? undefined);
}

export async function deleteWordStudy(formData: FormData) {
  const id = num(formData, "id");
  const passageId = optNum(formData, "passageId");
  if (!id) return;
  await db.delete(wordStudies).where(eq(wordStudies.id, id));
  revalidateAll(passageId ?? undefined);
}

// ---------- Cross references ----------
export async function addCrossReference(formData: FormData) {
  const passageId = num(formData, "passageId");
  const reference = str(formData, "reference");
  if (!passageId || !reference) return;
  await db.insert(crossReferences).values({
    passageId,
    reference,
    type: (str(formData, "type") || "thematic") as XrefType,
    note: str(formData, "note"),
  });
  await touchPassage(passageId);
  revalidateAll(passageId);
}

export async function deleteCrossReference(formData: FormData) {
  const id = num(formData, "id");
  const passageId = num(formData, "passageId");
  if (!id) return;
  await db.delete(crossReferences).where(eq(crossReferences.id, id));
  revalidateAll(passageId);
}

// ---------- Themes ----------
export async function createTheme(formData: FormData) {
  const name = str(formData, "name");
  if (!name) return;
  const slug = slugify(name);
  await db
    .insert(themes)
    .values({
      name,
      slug,
      description: str(formData, "description"),
      color: str(formData, "color") || "#7c2d12",
    })
    .onConflictDoNothing({ target: themes.slug });
  revalidateAll();
}

export async function deleteTheme(formData: FormData) {
  const id = num(formData, "id");
  if (!id) return;
  await db.delete(themes).where(eq(themes.id, id));
  revalidateAll();
}

export async function togglePassageTheme(formData: FormData) {
  const passageId = num(formData, "passageId");
  const themeId = num(formData, "themeId");
  const attached = str(formData, "attached") === "1";
  if (!passageId || !themeId) return;
  if (attached) {
    await db
      .delete(passageThemes)
      .where(and(eq(passageThemes.passageId, passageId), eq(passageThemes.themeId, themeId)));
  } else {
    await db.insert(passageThemes).values({ passageId, themeId }).onConflictDoNothing();
  }
  await touchPassage(passageId);
  revalidateAll(passageId);
}

// ---------- Sources ----------
export async function createSource(formData: FormData) {
  const title = str(formData, "title");
  const author = str(formData, "author");
  if (!title || !author) return;
  await db.insert(sources).values({
    title,
    author,
    type: (str(formData, "type") || "commentary") as SourceType,
    year: optNum(formData, "year"),
    publisher: str(formData, "publisher"),
    url: str(formData, "url"),
  });
  revalidateAll();
}

export async function deleteSource(formData: FormData) {
  const id = num(formData, "id");
  if (!id) return;
  await db.delete(sources).where(eq(sources.id, id));
  revalidateAll();
}

export async function citeSource(formData: FormData) {
  const passageId = num(formData, "passageId");
  const sourceId = num(formData, "sourceId");
  if (!passageId || !sourceId) return;
  await db.insert(passageSources).values({
    passageId,
    sourceId,
    pages: str(formData, "pages"),
    note: str(formData, "note"),
  });
  await touchPassage(passageId);
  revalidateAll(passageId);
}

export async function removeCitation(formData: FormData) {
  const id = num(formData, "id");
  const passageId = num(formData, "passageId");
  if (!id) return;
  await db.delete(passageSources).where(eq(passageSources.id, id));
  revalidateAll(passageId);
}

// ---------- Setup ----------
export async function runSeed() {
  await seedAll();
  revalidateAll();
}

export async function runReset() {
  await resetKnowledgeBase();
  revalidateAll();
}
