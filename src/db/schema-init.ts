/**
 * Idempotent schema bootstrap, generated from `drizzle-kit generate` against
 * src/db/schema.ts and hand-wrapped so it is safe to run on every cold start:
 * enum/table/index creation is guarded, and foreign keys are added only if
 * missing. This lets a freshly provisioned, empty database (e.g. a new Neon
 * project) come up with no manual migration step.
 */
export const SCHEMA_INIT_SQL = `
do $$ begin
  create type "public"."original_language" as enum('hebrew', 'aramaic', 'greek');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "public"."note_type" as enum('observation', 'historical_context', 'literary_context', 'structure', 'grammar', 'theology', 'application', 'question');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "public"."source_type" as enum('commentary', 'lexicon', 'grammar', 'dictionary', 'monograph', 'article', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "public"."study_status" as enum('draft', 'in_progress', 'complete');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "public"."testament" as enum('OT', 'NT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "public"."xref_type" as enum('parallel', 'quotation', 'allusion', 'typology', 'fulfillment', 'contrast', 'thematic');
exception when duplicate_object then null; end $$;

create table if not exists "books" (
	"id" serial primary key not null,
	"name" varchar(64) not null,
	"abbreviation" varchar(12) not null,
	"testament" "testament" not null,
	"order_index" integer not null,
	"genre" varchar(48) not null,
	"chapters" integer not null,
	"language" "original_language" not null
);

create table if not exists "cross_references" (
	"id" serial primary key not null,
	"passage_id" integer not null,
	"reference" varchar(80) not null,
	"type" "xref_type" default 'thematic' not null,
	"note" text default '' not null,
	"created_at" timestamp default now() not null
);

create table if not exists "notes" (
	"id" serial primary key not null,
	"passage_id" integer not null,
	"type" "note_type" not null,
	"title" varchar(200) default '' not null,
	"body" text not null,
	"created_at" timestamp default now() not null
);

create table if not exists "passage_sources" (
	"id" serial primary key not null,
	"passage_id" integer not null,
	"source_id" integer not null,
	"pages" varchar(60) default '' not null,
	"note" text default '' not null
);

create table if not exists "passage_themes" (
	"passage_id" integer not null,
	"theme_id" integer not null,
	constraint "passage_themes_passage_id_theme_id_pk" primary key("passage_id","theme_id")
);

create table if not exists "passages" (
	"id" serial primary key not null,
	"book_id" integer not null,
	"chapter_start" integer not null,
	"verse_start" integer not null,
	"chapter_end" integer not null,
	"verse_end" integer not null,
	"title" varchar(200) not null,
	"translation" varchar(24) default 'WEB' not null,
	"text" text default '' not null,
	"summary" text default '' not null,
	"status" "study_status" default 'draft' not null,
	"created_at" timestamp default now() not null,
	"updated_at" timestamp default now() not null
);

create table if not exists "sources" (
	"id" serial primary key not null,
	"title" varchar(240) not null,
	"author" varchar(160) not null,
	"type" "source_type" default 'commentary' not null,
	"year" integer,
	"publisher" varchar(160) default '' not null,
	"url" varchar(400) default '' not null,
	"created_at" timestamp default now() not null
);

create table if not exists "themes" (
	"id" serial primary key not null,
	"name" varchar(80) not null,
	"slug" varchar(80) not null,
	"description" text default '' not null,
	"color" varchar(16) default '#7c2d12' not null,
	constraint "themes_slug_unique" unique("slug")
);

create table if not exists "word_studies" (
	"id" serial primary key not null,
	"passage_id" integer,
	"lemma" varchar(64) not null,
	"transliteration" varchar(64) not null,
	"language" "original_language" not null,
	"strongs" varchar(12) default '' not null,
	"gloss" varchar(200) not null,
	"semantic_range" text default '' not null,
	"occurrences" integer,
	"notes" text default '' not null,
	"created_at" timestamp default now() not null
);

do $$ begin
  alter table "cross_references" add constraint "cross_references_passage_id_passages_id_fk" foreign key ("passage_id") references "public"."passages"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "notes" add constraint "notes_passage_id_passages_id_fk" foreign key ("passage_id") references "public"."passages"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "passage_sources" add constraint "passage_sources_passage_id_passages_id_fk" foreign key ("passage_id") references "public"."passages"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "passage_sources" add constraint "passage_sources_source_id_sources_id_fk" foreign key ("source_id") references "public"."sources"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "passage_themes" add constraint "passage_themes_passage_id_passages_id_fk" foreign key ("passage_id") references "public"."passages"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "passage_themes" add constraint "passage_themes_theme_id_themes_id_fk" foreign key ("theme_id") references "public"."themes"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "passages" add constraint "passages_book_id_books_id_fk" foreign key ("book_id") references "public"."books"("id") on delete cascade on update no action;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "word_studies" add constraint "word_studies_passage_id_passages_id_fk" foreign key ("passage_id") references "public"."passages"("id") on delete set null on update no action;
exception when duplicate_object then null; end $$;

create index if not exists "xrefs_passage_idx" on "cross_references" using btree ("passage_id");
create index if not exists "notes_passage_idx" on "notes" using btree ("passage_id");
create index if not exists "passage_sources_passage_idx" on "passage_sources" using btree ("passage_id");
create index if not exists "passages_book_idx" on "passages" using btree ("book_id","chapter_start");
create index if not exists "word_studies_lemma_idx" on "word_studies" using btree ("lemma");
`;
