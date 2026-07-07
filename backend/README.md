# LEOR Backend

Premium gourmet e-commerce REST API — NestJS 11 + Prisma 6 + PostgreSQL, with optional Redis caching.

## Setup

```bash
cd backend
npm install
cp .env.example .env        # or create .env with the vars below
npx prisma generate
npx prisma migrate dev      # creates the database schema
npm run prisma:seed         # roles, permissions, admin user, demo catalog
npm run start:dev           # API at http://localhost:4000/api/v1
```

Default super admin: `admin@leor.sa` / `ChangeMe123!` (change it immediately).

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `PORT` | no | `4000` | HTTP port |
| `FRONTEND_ORIGIN` | no | `*` | Comma-separated CORS origins |
| `JWT_ACCESS_SECRET` | yes (prod) | dev fallback | Access-token signing secret |
| `JWT_ACCESS_TTL` | no | `15m` | Access-token lifetime |
| `REDIS_URL` | no | `redis://localhost:6379` | Cache; API degrades gracefully without Redis |
| `S3_BUCKET` | no | — | S3 bucket for uploads (presign returns 503 if unset) |
| `S3_REGION` / `AWS_REGION` | no | — | S3 region |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | no | — | S3 credentials |
| `S3_ENDPOINT` | no | — | Custom S3-compatible endpoint (MinIO etc.) |
| `S3_PUBLIC_URL` | no | derived | Public base URL for uploaded objects |

## Endpoints

All routes are prefixed with `/api/v1`. Auth = Bearer access token. Perm = required permission.

### Auth & account
| Method | Path | Access |
|---|---|---|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public (refresh token) |
| POST | `/auth/logout` | auth |
| GET | `/auth/me` | auth |
| PATCH | `/users/me/profile`, `/users/me/password` | auth |
| GET/PATCH | `/users`, `/users/:id` | `customers:read` / `customers:write` |
| CRUD | `/addresses` | auth |

### Catalog
| Method | Path | Access |
|---|---|---|
| GET | `/categories`, `/categories/:slug` | public |
| POST/PATCH/DELETE | `/categories`, `/categories/:id` | `products:write` |
| GET | `/products?category&q&sale&featured&minPrice&maxPrice&sort&page&limit` | public (Redis-cached 60s) |
| GET | `/products/:slug` (images, variants, approved reviews, related) | public |
| POST/PATCH/DELETE | `/products`, `/products/:id` (nested `images` replace set) | `products:write` |

### Inventory (`inventory:write`)
| Method | Path | Notes |
|---|---|---|
| GET | `/inventory/stock?filter=low\|out&search` | paginated |
| POST | `/inventory/adjust` | `{productId, change, reason: RESTOCK\|ADJUSTMENT, note?}` |
| GET | `/inventory/movements?productId` | paginated |
| GET | `/inventory/alerts` | stock ≤ lowStockThreshold |

### Orders
| Method | Path | Access |
|---|---|---|
| POST | `/orders` | public, throttled — returns `{order, invoiceNumber, whatsappUrl}` |
| GET | `/orders?search&status&payment&from&to` | `orders:read` |
| GET | `/orders/mine` | auth customer |
| GET | `/orders/track/:number` | public (status only) |
| GET | `/orders/:number` | `orders:read` |
| PATCH | `/orders/:number/status` | `orders:write` (CANCELLED restocks + refunds) |
| PATCH | `/orders/:number/note` | `orders:write` |

### Invoices
| Method | Path | Access |
|---|---|---|
| GET | `/invoices?search&status` | `invoices:read` |
| GET | `/invoices/:number` | `invoices:read`, or public with `?phone=` matching the order |
| GET | `/invoices/:number/pdf` | same as above — streams A4 PDF |
| PATCH | `/invoices/:number/status` | `orders:write` |
| POST | `/invoices/:number/resend` | `invoices:read` |

### Marketing & engagement
| Method | Path | Access |
|---|---|---|
| POST | `/coupons/validate` `{code, subtotal}` | public |
| GET/POST/PATCH/DELETE | `/coupons` | `products:write` |
| POST | `/reviews` | public, throttled (pending approval) |
| GET | `/reviews?productId` | public (approved only) |
| GET | `/reviews/admin`, PATCH `/reviews/:id/approve`, DELETE `/reviews/:id` | `products:write` |
| GET/POST/DELETE | `/wishlist`, `/wishlist/:productId` | auth (POST toggles) |

### Platform
| Method | Path | Access |
|---|---|---|
| GET | `/notifications?unread=true` | auth |
| GET | `/notifications/feed` | admin (`orders:read`) |
| PATCH | `/notifications/:id/read`, POST `/notifications/mark-all-read` | auth |
| GET | `/settings/public` | public (whitelisted keys) |
| GET/PUT | `/settings` | `settings:write` (PUT body: `{entries: [{key, value}]}`) |
| GET | `/reports/summary`, `/reports/sales?granularity&from&to`, `/reports/top-products`, `/reports/top-customers`, `/reports/cities`, `/reports/inventory` | `reports:read` |
| POST | `/uploads/presign` `{filename, contentType}` | `products:write` |
| POST | `/contact` | public, throttled |
| GET | `/contact`, PATCH `/contact/:id/handled` | `customers:read` / `customers:write` |

## Roles & permissions

| Role | Permissions |
|---|---|
| SUPER_ADMIN / ADMIN | all |
| MANAGER | orders:*, products:*, inventory:write, reports:read |
| EMPLOYEE | orders:read, orders:write |
| CUSTOMER | none (customer-scoped routes only) |
