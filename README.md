# Leather Goods Texas (LGT)

Retail + wholesale e-commerce platform for genuine leather goods (belts, wallets,
keychains, purses, handbags, and custom logo-embossed products), built on Next.js
(App Router), PostgreSQL/Prisma, Auth.js, and Stripe. Live at
[leathergoodstexas.com](https://leathergoodstexas.com).

This repo is at **Phase 1 — Retail catalog, design system, SEO**: product/category
browsing, PDP with variant selection, home page, and SEO plumbing (sitemap, robots,
JSON-LD, per-page metadata) on top of Phase 0's foundations (auth, theme, database).
Cart/checkout, the wholesale portal, and the admin panel land in later phases (see
the plan history for the full roadmap).

## Stack

- **Framework:** Next.js 16 (App Router). Note: Next.js renamed `middleware.ts` to
  [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) —
  that's `src/proxy.ts` here, not a typo.
- **Database:** PostgreSQL via Prisma ORM 7 (driver-adapter based — see `src/lib/prisma.ts`).
  Production runs on Supabase; migrations against it must use the session-pooler
  connection string (port 5432), not the transaction pooler the app uses at runtime
  (port 6543) — the transaction pooler can't run schema migrations.
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

4. Run migrations, seed the product catalog, and (optionally) a local dev admin login:

   ```bash
   npm run db:migrate
   npm run db:seed          # categories/products/variants — safe for any environment
   npm run db:seed:dev      # admin@lgt.test / changeme123 — LOCAL ONLY, never run against prod
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
│   ├── (retail)/         # public storefront: /, /shop, /shop/[category]/[slug], /custom
│   ├── (auth)/           # /login, /register
│   ├── api/               # route handlers (Auth.js, webhooks, ...)
│   ├── sitemap.ts, robots.ts
│   └── globals.css        # Tailwind v4 theme tokens
├── components/{ui,retail,auth}/
├── lib/                    # prisma client, auth config, DAL, validation, utils, seo
├── server/{actions,repositories}/  # Server Actions + read-side data access
├── generated/prisma/       # generated Prisma Client (gitignored, run `prisma generate`)
└── proxy.ts                # role-based route protection (optimistic checks only)
```

`(wholesale)` and `(admin)` route groups, cart/checkout, and the rest of the data
model (orders, wholesale accounts, customization) land in later phases.

## Useful commands

| Command              | Purpose                                       |
| --------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the dev server                           |
| `npm run build`        | Production build                               |
| `npm run lint`         | Lint                                           |
| `npm run db:migrate`   | Create/apply a Prisma migration                |
| `npm run db:seed`      | Seed the product catalog (safe for any environment) |
| `npm run db:seed:dev`  | Seed a local dev admin login (local only)      |
| `npm run db:studio`    | Open Prisma Studio                             |
