# AGENTS.md - DataAI

## Critical Gotchas

### Database Required for Local Dev
The app **will not start** without `POSTGRES_URL` set. Auth.js auto-redirects all routes to `/api/auth/guest` which creates a user in PostgreSQL. No DB = immediate crash on first request.

**To verify the app actually works locally:**
```bash
pnpm dev          # Start server
# Then visit http://localhost:3000 in browser
# curl is NOT sufficient - auth redirects won't follow properly
```

**Build passing ≠ app works.** `pnpm build` only checks TypeScript compilation.

### Environment Variables
Copy `.env.example` to `.env.local` and fill in ALL values. The app needs:
- `POSTGRES_URL` - Required. Use Neon or Supabase.
- `AUTH_SECRET` - Required. Generate with `openssl rand -base64 32`
- `AI_GATEWAY_API_KEY` - Required for AI features
- `STRIPE_SECRET_KEY` - Required for payments
- `STRIPE_PRICE_ID_PRO` - Required for checkout
- `STRIPE_WEBHOOK_SECRET` - Required for webhooks

### Database Migrations
After ANY schema change in `lib/db/schema.ts`:
```bash
pnpm db:generate    # Creates migration file
pnpm db:migrate     # Applies to database
```

The `build` script auto-runs migrations: `tsx lib/db/migrate && next build`

## Commands

```bash
# Development (requires DB)
pnpm dev                    # Starts on localhost:3000

# Verification (run these before committing)
pnpm check                  # Lint + typecheck (ultracite/biome)
pnpm fix                    # Auto-fix lint issues
pnpm build                  # TypeScript + build

# Database
pnpm db:generate            # Generate migration from schema changes
pnpm db:migrate             # Apply pending migrations
pnpm db:studio              # Drizzle Studio GUI
pnpm db:push                # Push schema (dev only, skips migrations)

# Testing
pnpm test                   # Playwright e2e tests (requires dev server running)
```

## Architecture

**Framework:** Next.js 16 App Router with React Server Components
**Database:** Drizzle ORM + PostgreSQL (Neon recommended)
**Auth:** Auth.js 5.0 beta with credentials + guest providers
**AI:** Vercel AI SDK v6 with multi-provider gateway
**Payments:** Stripe with checkout sessions
**Styling:** Tailwind CSS 4 + shadcn/ui

### Key Directories
- `app/(chat)/` - Main chat interface, protected routes
- `app/(auth)/` - Login/register, auth API routes
- `app/api/` - API routes (chat, checkout, webhooks)
- `lib/ai/` - AI configuration, prompts, tools
- `lib/db/` - Schema, queries, migrations
- `artifacts/` - Code/text/sheet artifact renderers
- `components/chat/` - Chat UI components

### Auth Flow
1. User visits any page → middleware checks session
2. No session → redirects to `/api/auth/guest`
3. Guest provider creates user in DB via `createGuestUser()`
4. If DB fails → 400 error, app is completely broken
5. Session cookie set → user can access app

**Guest auth is the ONLY auth method enabled.** There's no real login/register UI connected.

### Data Flow
1. User uploads CSV → parsed client-side in `components/chat/data-upload.tsx`
2. Data stored in React context (`hooks/use-data.tsx`)
3. First chat message prepends data context automatically
4. AI receives: schema + 5 sample rows + column types + user question
5. AI generates Python code → executed in browser via Pyodide
6. Results stream back as artifacts

### Payment Flow
1. Free user hits 5-analysis daily limit
2. "Upgrade" button → calls `POST /api/checkout`
3. Stripe checkout session created → redirects to Stripe
4. Payment success → Stripe webhook hits `POST /api/webhooks/stripe`
5. Webhook updates `subscription` table → user gets Pro
6. Pro users bypass usage limits entirely

## Stripe Setup Checklist

Before payments work:
1. Create Stripe account
2. Create Product + Price ($29/month recurring)
3. Copy Price ID to `STRIPE_PRICE_ID_PRO`
4. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
5. Login: `stripe login`
6. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
7. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Common Issues

**"Failed to create guest user"**
→ Database not running or `POSTGRES_URL` not set

**Build succeeds but app crashes**
→ Check `pnpm dev` output, look for DB connection errors

**Type errors in Stripe code**
→ Stripe SDK types change frequently. Cast to `unknown` then to expected type if needed.

**Usage limits not resetting**
→ Limits stored in localStorage key `dataai_usage`. Clear in DevTools → Application → Local Storage

## Testing

**Manual QA (required before shipping):**
1. `pnpm dev` → verify page loads
2. Click "Try with sample data" → verify table appears
3. Type a question → verify AI responds
4. Send 5 messages → verify limit warning appears
5. Click upgrade → verify Stripe checkout opens (test mode)
6. Complete test payment → verify Pro status
7. Test exports: create code/text/sheet artifacts, click download buttons

**Automated:**
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm test    # Playwright tests (very slow, 240s timeout)
```

## Deployment

**Vercel (recommended):**
1. `vercel link` → connect project
2. `vercel env pull` → download env vars
3. Set `POSTGRES_URL` in Vercel dashboard
4. Set all Stripe keys in Vercel dashboard
5. Add Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
6. Deploy: `git push` (auto-deploys)

**Database migrations on deploy:**
The `build` script runs `tsx lib/db/migrate` before `next build`, so migrations auto-apply on each deploy.

## Code Style

- **Linting:** Biome with ultracite preset
- **Formatter:** Biome (not Prettier)
- **Indent:** 2 spaces
- **Line endings:** LF
- **Semicolons:** Yes
- **Quotes:** Double
- **Import sorting:** Biome auto-sorts
- **No `any` type** unless absolutely necessary

**Never skip `pnpm check` before committing.** The CI will reject it.
