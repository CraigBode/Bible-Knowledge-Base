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

2. Have a PostgreSQL database available. Copy `.env.example` to `.env` and set `DATABASE_URL`
   and `APP_PASSWORD`:

   ```bash
   cp .env.example .env
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

The database schema (tables, enums, indexes) and the canon (all 66 books), starter themes, a
sample bibliography, and four fully worked sample studies are all created automatically the
first time any page loads against an empty database — there is no separate migration command
to run. You can also trigger or reset seeding from the **Knowledge Base Setup** page in the app.
`npm run db:push` is available if you'd rather push schema changes ahead of time during
development; see the comment atop `src/db/schema.ts` if you change the schema, since
`src/db/schema-init.ts` (the auto-bootstrap SQL) needs to be regenerated to match.

Every page requires the password set in `APP_PASSWORD` — there is no separate login per
person, just one shared password gate (see `src/proxy.ts` and `src/app/login`).

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

## Deploying (Vercel + Neon, free tier)

This turns the app into a normal web address you open in a browser — nothing to install on
any computer. One-time setup:

1. **Database.** Go to [neon.tech](https://neon.tech), sign up free, and create a project. On
   the project dashboard, copy the **connection string** it shows you (starts with
   `postgresql://...`).
2. **Hosting.** Go to [vercel.com](https://vercel.com) and sign up free using your GitHub
   account.
3. Click **Add New → Project**, and import the `Bible-Knowledge-Base` repository from GitHub.
4. Before clicking Deploy, open **Environment Variables** and add two:
   - `DATABASE_URL` — paste the Neon connection string from step 1.
   - `APP_PASSWORD` — a password of your choosing. This is what guards the whole app.
5. Click **Deploy**. After a minute or two, Vercel gives you a URL like
   `bible-knowledge-base.vercel.app`.
6. Open that URL, enter your password, and the app will set up its own database tables and
   sample studies on that first visit. Bookmark the URL.

To change the password later, or move to a different database, edit the environment variables
in the Vercel project's **Settings** and redeploy (Vercel does this automatically when you save
changed environment variables, or via the **Redeploy** button on the latest deployment).

## API

`GET /api/health` — database connectivity check.

`GET /api/passages` — read-only JSON export of every passage study, with its notes, word
studies, cross-references, themes, and cited sources.
