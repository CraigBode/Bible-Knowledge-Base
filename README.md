# Bible Knowledge Base

A structured knowledge base for biblical exegesis, built with Next.js, PostgreSQL, and Drizzle ORM.

Passage studies are organized around a classical eight-step exegetical method — observation,
historical context, literary context, structure, grammar, theological synthesis, application,
and open questions — with original-language (Hebrew, Aramaic, Greek) word studies, typed
cross-references, biblical-theological themes, and a working bibliography attached to each study.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [PostgreSQL](https://www.postgresql.org) via [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com) v4

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Have a PostgreSQL database available and set `DATABASE_URL`. Copy `.env.example` to `.env`
   and adjust as needed:

   ```bash
   cp .env.example .env
   ```

3. Push the schema to the database:

   ```bash
   npm run db:push
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

The canon (all 66 books), starter themes, a sample bibliography, and four fully worked sample
studies are seeded automatically the first time any page loads against an empty database. You
can also trigger or reset seeding from the **Knowledge Base Setup** page in the app.

## Scripts

| Script              | Purpose                                   |
| -------------------- | ------------------------------------------ |
| `npm run dev`         | Start the development server                |
| `npm run build`       | Production build                            |
| `npm run start`       | Run the production build                    |
| `npm run lint`        | Lint with ESLint                            |
| `npm run typecheck`   | Type-check with `tsc --noEmit`              |
| `npm run db:push`     | Push the Drizzle schema to the database     |
| `npm run db:studio`   | Open Drizzle Studio against the database    |

## API

`GET /api/health` — database connectivity check.

`GET /api/passages` — read-only JSON export of every passage study, with its notes, word
studies, cross-references, themes, and cited sources.
