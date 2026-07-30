# LGT — Genuine Leather Goods

Retail + wholesale e-commerce platform for genuine leather goods (belts, wallets,
keychains, purses, handbags, and custom logo-embossed products), built on Next.js
(App Router), PostgreSQL/Prisma, Auth.js, and Stripe.

This repo is at **Phase 0 — Foundations**: project scaffold, design tokens, database
connection, and role-aware auth. The retail catalog, cart/checkout, wholesale portal,
and admin panel land in later phases (see the plan history for the full roadmap).

## Stack

- **Framework:** Next.js 16 (App Router). Note: Next.js renamed `middleware.ts` to
  [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) —
  that's `src/proxy.ts` here, not a typo.
- **Database:** PostgreSQL via Prisma ORM 7 (driver-adapter based — see `src/lib/prisma.ts`).
- **Auth:** Auth.js (NextAuth v5) with the Prisma adapter, JWT sessions carrying a
  `role` (`CUSTOMER | WHOLESALER | ADMIN`).
- **Styling:** Tailwind CSS v4 (CSS-native theme, see `src/app/globals.css`) with a
  strict two-color brand palette — cream (`--color-cream`) + saddle tan
  (`--color-saddle`), ink (`--color-ink`) for text.

## Getting started

1. Copy the env template and adjust if needed:

   ```bash
   cp .env.example .env
   ```

2. Start local Postgres (via Docker):

   ```bash
   docker compose up -d
   ```

3. Install dependencies (also generates the Prisma client via `postinstall`):

   ```bash
   npm install
   ```

4. Run migrations and seed a dev admin user (`admin@lgt.test` / `changeme123`):

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (retail)/     # public storefront route group
│   ├── (auth)/       # /login, /register
│   ├── api/          # route handlers (Auth.js, webhooks, ...)
│   └── globals.css   # Tailwind v4 theme tokens
├── components/{ui,retail,auth}/
├── lib/              # prisma client, auth config, DAL, validation, utils
├── server/actions/   # Server Actions (auth, ...)
├── generated/prisma/ # generated Prisma Client (gitignored, run `prisma generate`)
└── proxy.ts          # role-based route protection (optimistic checks only)
```

`(wholesale)` and `(admin)` route groups, the product catalog schema, cart/checkout,
and the rest of the data model land in later phases.

## Useful commands

| Command             | Purpose                                   |
| -------------------- | ------------------------------------------ |
| `npm run dev`         | Start the dev server                       |
| `npm run build`       | Production build                           |
| `npm run lint`        | Lint                                       |
| `npm run db:migrate`  | Create/apply a Prisma migration            |
| `npm run db:seed`     | Re-run the seed script                     |
| `npm run db:studio`   | Open Prisma Studio                         |
