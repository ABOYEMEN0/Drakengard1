# LEOR — Premium Gourmet E-Commerce Platform

A production-ready luxury e-commerce platform for **LEOR**, a maison of premium
coffee, chocolate, nuts, brewing accessories and gourmet gifts. Navy-and-gold
minimal-luxury design, complete customer & admin experiences, order + invoice
generation, WhatsApp order confirmation and role-based access control.

## Monorepo layout

```
frontend/   Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion
backend/    NestJS 11 · Prisma ORM · PostgreSQL · Redis · JWT + RBAC · PDF invoices
nginx/      Reverse proxy (rate limiting, caching, HTTPS-ready)
docker-compose.yml
.github/workflows/ci.yml
```

## Brand system

| Token | Value |
|---|---|
| Primary (Navy) | `#0F2345` |
| Secondary (Gold) | `#D8B46A` |
| Background | `#F8F6F2` |
| Text primary / secondary | `#2B2B2B` / `#6F6F6F` |
| Success | `#5E7B45` |
| Radius | 12px |
| Fonts | Cormorant Garamond (display) · Inter (body) · IBM Plex Sans Arabic |

The logo lives at `frontend/public/logo.svg` (plus `logo-light.svg`,
`logo-mark.svg`, `favicon.svg`) — replace these files with the official
uploaded artwork to swap the identity everywhere at once.

## Quick start (development)

```bash
# Storefront (works standalone with a rich demo catalog)
cd frontend && npm install && npm run dev        # http://localhost:3000

# API (requires PostgreSQL; Redis optional)
cd backend && npm install
cp .env.example .env                             # edit DATABASE_URL etc.
npx prisma migrate dev && npm run prisma:seed
npm run start:dev                                # http://localhost:4000/api/v1
```

Seed admin: `admin@leor.sa` / `ChangeMe123!` (change immediately).
Storefront demo sign-in: any email works; `admin@leor.sa` unlocks `/admin`.

## Production

```bash
docker compose up -d --build
```

Nginx fronts everything on :80 (HTTPS block ready — mount certificates and
enable the 443 server). CI (GitHub Actions) typechecks and builds both apps
and the Docker images.

## Key flows

- **Ordering** — cart → checkout (COD or bank transfer, no payment gateway) →
  the backend atomically mints `LR-<year><seq>` order numbers and
  `INV-<year><seq>` invoice numbers from a row-locked sequence (never
  duplicated), deducts stock, then the customer is redirected to WhatsApp with
  a pre-formatted confirmation message.
- **Invoices** — server-side PDF generation (pdfkit) at
  `GET /api/v1/invoices/:number/pdf`; printable HTML invoice in the storefront.
- **Order lifecycle** — Pending → Under Review → Confirmed → Preparing →
  Ready for Delivery → Out for Delivery → Delivered (or Cancelled, which
  restocks inventory); each status has its own color and timeline view.
- **Inventory** — automatic deduction on order, movement audit trail,
  low-stock alerts, restock on cancellation.
- **RBAC** — Super Admin / Admin / Manager / Employee / Customer with a
  permission matrix enforced by guards on every admin endpoint.

## Frontend pages

Home, Shop (filters/sort), Categories, Product details (gallery zoom, reviews,
related, recently viewed, share), Cart (coupons), Checkout, Order confirmation
(WhatsApp), Invoice (printable), Track order (timeline), Customer dashboard
(orders, invoices, addresses, notifications, settings, repeat order), Admin
dashboard (analytics, orders, products CRUD, categories, inventory, customers,
invoices, reports, settings), About, Contact, FAQ, Privacy, Terms, Login,
Register, Forgot password, Wishlist, Search, 404.

## SEO / performance / accessibility / security

SEO-friendly URLs, per-page metadata + Open Graph, JSON-LD structured data,
`sitemap.xml` + `robots.txt`, canonical URLs · lazy-loaded optimized images,
Redis caching, soft skeletons · WCAG-minded semantic HTML, keyboard and
screen-reader support, visible focus states · helmet, CSRF-safe httpOnly
refresh cookies, bcrypt passwords, JWT rotation, rate limiting (Nest throttler
+ nginx), validation whitelisting, Prisma-parameterized SQL.

The frontend ships with a self-contained demo catalog and localStorage-backed
cart/orders so the full experience is explorable without the API; point
`NEXT_PUBLIC_API_URL` at the backend to go live. The architecture (REST,
typed domain model shared conceptually with Prisma, stateless JWT) is ready
for future mobile apps and payment gateways without structural change.
