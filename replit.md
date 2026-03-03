# Kirana Asaan

## Overview

Kirana Asaan is a mobile-first shop management application designed for small Kirana (grocery) store owners in South Asia. It provides tools for managing daily sales, customer credit (Udhar) tracking, purchases, expenses, and shop settings. The app uses Urdu/Hindi terminology throughout the UI (e.g., "Udhar Diya" for credit given, "Wapas Mila" for payment received) to make it accessible to its target audience.

The application follows a full-stack TypeScript architecture with a React frontend served by an Express backend, backed by PostgreSQL via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Structure

The project uses a monorepo-style layout with three main directories:

- **`client/`** — React SPA frontend (Vite-bundled)
- **`server/`** — Express.js API backend
- **`shared/`** — Shared TypeScript types, schemas, and route definitions used by both client and server

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite (with HMR via a custom `server/vite.ts` dev setup)
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for all server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Forms**: React Hook Form with Zod resolvers for validation
- **Styling**: Tailwind CSS with CSS custom properties for theming (green/emerald primary palette). Custom font families: Inter (body) and Outfit (headings)
- **Responsive Design**: Mobile-first approach with a max-width container (`max-w-lg`) for mobile app feel, but fully functional on desktop browsers.
- **PWA Ready**: Configured for installation as a standalone app on mobile and desktop devices.

Key frontend pages:
- Login (phone + PIN authentication)
- Home (dashboard with today's sales summary and credit overview)
- Customers (customer list with search, add customer dialog)
- Customer Ledger (per-customer transaction history with give/receive credit)
- Sales (daily sales recording with date navigation)
- Ledger (purchases and expenses tracking with tabs)
- Settings (shop profile management)

Custom hooks encapsulate all API interactions: `use-auth`, `use-customers`, `use-transactions`, `use-sales`, `use-ledger`.

### Backend Architecture

- **Framework**: Express 5 running on Node.js
- **Language**: TypeScript (executed via `tsx` in dev, bundled with esbuild for production)
- **Authentication**: Passport.js with Local Strategy (phone number as username, PIN as password)
- **Sessions**: Express sessions stored in PostgreSQL via `connect-pg-simple`
- **Password Security**: scrypt-based hashing with random salts
- **API Pattern**: RESTful JSON API under `/api/` prefix with authentication middleware (`requireAuth`)
- **Seed Data**: Auto-seeds a default user (phone: `03001234567`, PIN: `1234`) on first run

Key API routes (defined in `shared/routes.ts`):
- Auth: `/api/login`, `/api/logout`, `/api/user`, profile update
- Customers: CRUD at `/api/customers`
- Transactions: `/api/transactions` (credit give/receive per customer)
- Sales: `/api/sales`
- Purchases: `/api/purchases`
- Expenses: `/api/expenses`

### Data Storage

- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation-schema generation
- **Schema Push**: `npm run db:push` uses `drizzle-kit push` (no migration files needed for development)
- **Tables**:
  - `users` — Shop owner accounts (username/phone, hashed password/PIN, shop name, owner name)
  - `customers` — Customer profiles per shop with running balance (`total_balance`)
  - `transactions` — Credit ledger entries (type: 'give' or 'receive') linked to customers
  - `sales` — Daily sales records (type: 'cash_sale' or 'cash_in_hand')
  - `purchases` — Purchase records from suppliers
  - `expenses` — Shop expense records by category
- **Storage Layer**: `DatabaseStorage` class in `server/storage.ts` implements an `IStorage` interface, abstracting all database operations

### Build and Deployment

- **Dev**: `npm run dev` — runs `tsx server/index.ts` which sets up Vite middleware for HMR
- **Build**: `npm run build` — Vite builds the client to `dist/public/`, esbuild bundles the server to `dist/index.cjs`
- **Production**: `npm start` — runs the bundled server which serves static files from `dist/public/`
- **Type Check**: `npm run check` — runs TypeScript compiler in noEmit mode

### Path Aliases

- `@/*` → `client/src/*` (frontend imports)
- `@shared/*` → `shared/*` (shared code)
- `@assets` → `attached_assets/` (static assets from design references)

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, required via `DATABASE_URL` environment variable
- **connect-pg-simple** — PostgreSQL-backed session store

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** — Database ORM and schema management
- **express** (v5) — HTTP server framework
- **passport** + **passport-local** — Authentication
- **@tanstack/react-query** — Client-side data fetching and caching
- **react-hook-form** + **@hookform/resolvers** — Form management with Zod validation
- **zod** + **drizzle-zod** — Schema validation (shared between client and server)
- **wouter** — Client-side routing
- **date-fns** — Date formatting and manipulation
- **recharts** — Dashboard charts (referenced in requirements)
- **shadcn/ui components** — Full suite of Radix-based UI primitives (dialog, tabs, select, toast, etc.)
- **tailwindcss** — Utility-first CSS framework
- **vaul** — Drawer component
- **embla-carousel-react** — Carousel component

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal** — Runtime error overlay in development
- **@replit/vite-plugin-cartographer** — Dev tooling (dev only)
- **@replit/vite-plugin-dev-banner** — Dev banner (dev only)

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (must be provisioned)
- `SESSION_SECRET` — Optional, defaults to `"kirana_secret_key"` if not set