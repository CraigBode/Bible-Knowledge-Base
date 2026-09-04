import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  varchar,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Enums ----------
export const testamentEnum = pgEnum("testament", ["OT", "NT"]);
export const languageEnum = pgEnum("original_language", [
  "hebrew",
  "aramaic",
  "greek",
]);
export const statusEnum = pgEnum("study_status", [
  "draft",
  "in_progress",
  "complete",
]);
export const noteTypeEnum = pgEnum("note_type", [
  "observation",
  "historical_context",
  "literary_context",
  "structure",
  "grammar",
  "theology",
  "application",
  "question",
]);
export const xrefTypeEnum = pgEnum("xref_type", [
  "parallel",
  "quotation",
  "allusion",
  "typology",
  "fulfillment",
  "contrast",
  "thematic",
]);
export const sourceTypeEnum = pgEnum("source_type", [
  "commentary",
  "lexicon",
  "grammar",
  "dictionary",
  "monograph",
  "article",
  "other",
]);

// ---------- Canon ----------
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 12 }).notNull(),
  testament: testamentEnum("testament").notNull(),
  orderIndex: integer("order_index").notNull(),
  genre: varchar("genre", { length: 48 }).notNull(),
  chapters: integer("chapters").notNull(),
  language: languageEnum("language").notNull(),
});

// ---------- Passage studies ----------
export const passages = pgTable(
  "passages",
  {
    id: serial("id").primaryKey(),
    bookId: integer("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chapterStart: integer("chapter_start").notNull(),
    verseStart: integer("verse_start").notNull(),
    chapterEnd: integer("chapter_end").notNull(),
    verseEnd: integer("verse_end").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    translation: varchar("translation", { length: 24 }).notNull().default("WEB"),
    text: text("text").notNull().default(""),
    summary: text("summary").notNull().default(""),
    status: statusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("passages_book_idx").on(t.bookId, t.chapterStart)]
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    passageId: integer("passage_id")
      .notNull()
      .references(() => passages.id, { onDelete: "cascade" }),
    type: noteTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull().default(""),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notes_passage_idx").on(t.passageId)]
);

// ---------- Lexicon / word studies ----------
export const wordStudies = pgTable(
  "word_studies",
  {
    id: serial("id").primaryKey(),
    passageId: integer("passage_id").references(() => passages.id, {
      onDelete: "set null",
    }),
    lemma: varchar("lemma", { length: 64 }).notNull(),
    transliteration: varchar("transliteration", { length: 64 }).notNull(),
    language: languageEnum("language").notNull(),
    strongs: varchar("strongs", { length: 12 }).notNull().default(""),
    gloss: varchar("gloss", { length: 200 }).notNull(),
    semanticRange: text("semantic_range").notNull().default(""),
    occurrences: integer("occurrences"),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("word_studies_lemma_idx").on(t.lemma)]
);

// ---------- Themes ----------
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  description: text("description").notNull().default(""),
  color: varchar("color", { length: 16 }).notNull().default("#7c2d12"),
});

export const passageThemes = pgTable(
  "passage_themes",
  {
    passageId: integer("passage_id")
      .notNull()
      .references(() => passages.id, { onDelete: "cascade" }),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.passageId, t.themeId] })]
);

// ---------- Cross references ----------
export const crossReferences = pgTable(
  "cross_references",
  {
    id: serial("id").primaryKey(),
    passageId: integer("passage_id")
      .notNull()
      .references(() => passages.id, { onDelete: "cascade" }),
    reference: varchar("reference", { length: 80 }).notNull(),
    type: xrefTypeEnum("type").notNull().default("thematic"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("xrefs_passage_idx").on(t.passageId)]
);

// ---------- Bibliography ----------
export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 240 }).notNull(),
  author: varchar("author", { length: 160 }).notNull(),
  type: sourceTypeEnum("type").notNull().default("commentary"),
  year: integer("year"),
  publisher: varchar("publisher", { length: 160 }).notNull().default(""),
  url: varchar("url", { length: 400 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passageSources = pgTable(
  "passage_sources",
  {
    id: serial("id").primaryKey(),
    passageId: integer("passage_id")
      .notNull()
      .references(() => passages.id, { onDelete: "cascade" }),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    pages: varchar("pages", { length: 60 }).notNull().default(""),
    note: text("note").notNull().default(""),
  },
  (t) => [index("passage_sources_passage_idx").on(t.passageId)]
);

// ---------- Relations ----------
export const booksRelations = relations(books, ({ many }) => ({
  passages: many(passages),
}));

export const passagesRelations = relations(passages, ({ one, many }) => ({
  book: one(books, { fields: [passages.bookId], references: [books.id] }),
  notes: many(notes),
  wordStudies: many(wordStudies),
  passageThemes: many(passageThemes),
  crossReferences: many(crossReferences),
  passageSources: many(passageSources),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  passage: one(passages, { fields: [notes.passageId], references: [passages.id] }),
}));

export const wordStudiesRelations = relations(wordStudies, ({ one }) => ({
  passage: one(passages, {
    fields: [wordStudies.passageId],
    references: [passages.id],
  }),
}));

export const themesRelations = relations(themes, ({ many }) => ({
  passageThemes: many(passageThemes),
}));

export const passageThemesRelations = relations(passageThemes, ({ one }) => ({
  passage: one(passages, {
    fields: [passageThemes.passageId],
    references: [passages.id],
  }),
  theme: one(themes, { fields: [passageThemes.themeId], references: [themes.id] }),
}));

export const crossReferencesRelations = relations(crossReferences, ({ one }) => ({
  passage: one(passages, {
    fields: [crossReferences.passageId],
    references: [passages.id],
  }),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  passageSources: many(passageSources),
}));

export const passageSourcesRelations = relations(passageSources, ({ one }) => ({
  passage: one(passages, {
    fields: [passageSources.passageId],
    references: [passages.id],
  }),
  source: one(sources, {
    fields: [passageSources.sourceId],
    references: [sources.id],
  }),
}));

// ---------- Types ----------
export type Book = typeof books.$inferSelect;
export type Passage = typeof passages.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type WordStudy = typeof wordStudies.$inferSelect;
export type Theme = typeof themes.$inferSelect;
export type CrossReference = typeof crossReferences.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type PassageSource = typeof passageSources.$inferSelect;
