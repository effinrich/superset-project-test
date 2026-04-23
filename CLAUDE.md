# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
pnpm install                 # Install dependencies
pnpm dev                     # Start dev server (localhost:3000)
pnpm build                   # Build for production
pnpm check                   # Lint code (ultracite/biome)
pnpm fix                     # Auto-fix linting issues
pnpm test                    # Run Playwright e2e tests
pnpm db:migrate              # Run pending database migrations
pnpm db:generate             # Generate new migration based on schema changes
pnpm db:studio               # Open Drizzle Studio (interactive database viewer)
```

## Architecture

### Tech Stack

- **Framework**: Next.js 16.2.0 with App Router, React Server Components, React Compiler enabled
- **AI**: AI SDK v6 with Vercel AI Gateway (multi-provider: Mistral, Moonshot, DeepSeek, OpenAI, xAI)
- **Auth**: Auth.js 5.0 (beta)
- **Database**: Neon Postgres via Drizzle ORM
- **Storage**: Vercel Blob (file uploads), Redis (caching)
- **UI**: shadcn/ui components with Radix UI primitives, Tailwind CSS 4.1
- **Testing**: Playwright for e2e tests
- **Linting**: Biome with ultracite preset (code formatting, type checking)
- **Editor**: ProseMirror for document editing, CodeMirror for code blocks

### Directory Structure

- `app/` — Next.js App Router (grouped routes with `(auth)` and `(chat)`)
  - `(auth)/` — Login and registration flows with Auth.js integration
  - `(chat)/` — Main chat interface, document viewer, artifact displays
  - `api/` — Route handlers for chat, auth, database queries
- `lib/` — Shared utilities and business logic
  - `ai/` — LLM configuration, tool definitions (weather, document create/update, suggestions), provider routing
  - `db/` — Drizzle schema, migrations, database queries
  - `artifacts/` — Document/artifact parsing and formatting utilities
  - `editor/` — ProseMirror and CodeMirror editor integrations
  - `types.ts` — Type definitions for chat, tools, custom UI data
- `components/` — React components (excluding shadcn/ui and AI elements which are auto-generated)
  - `chat/` — Chat interface, message rendering, artifact components
  - `form/` — Auth forms (login, register)
  - `ui/` — Base UI components (buttons, inputs, etc., auto-managed by shadcn)
- `hooks/` — Custom React hooks (chat state, mobile detection, etc.)
- `artifacts/` — Artifact type definitions and processors for code, text, images, sheets
- `tests/` — Playwright e2e test files (runs against `http://localhost:PORT`)

### Data Model

**Core Tables** (Drizzle schema in `lib/db/schema.ts`):
- `users` — User accounts from Auth.js
- `chats` — Conversation sessions
- `messages` — Chat messages with custom UI data and tool results
- `suggestions` — AI-generated suggestions within documents
- `artifacts` — Documents created during chats (code, text, images, spreadsheets)

**Key Types** (`lib/types.ts`):
- `ChatMessage` — UI message with metadata, custom data types, tool calls
- `CustomUIDataTypes` — Extensible types for streaming content: `textDelta`, `imageDelta`, `codeDelta`, `sheetDelta`, `suggestion`, artifact lifecycle events
- `ChatTools` — Tool definitions: `getWeather`, `createDocument`, `updateDocument`, `requestSuggestions`

### AI Integration

**Models** configured in `lib/ai/models.ts`:
- Loaded via Vercel AI Gateway with per-model provider routing
- Format: `"provider/model"` (e.g., `"mistral/large"`)

**System Prompt** in `lib/ai/prompts.ts`:
- Defines tool usage behavior and response format for artifacts
- Includes guidelines for document creation, updates, and suggestions

**Tools** in `lib/ai/tools/`:
- `getWeather` — Weather lookup (UI tool with real-time result)
- `createDocument` — Create artifacts (code/text/image/sheet) with inline preview
- `updateDocument` — Modify existing artifacts
- `requestSuggestions` — Generate suggestions for document sections

### Authentication

- Auth.js 5.0 (beta) with session-based auth
- Routes: `/(auth)/login`, `/(auth)/register`, `/(auth)/api/auth/*`
- Protected routes in `/(chat)/` check `session` via Server Components
- Role: Optional next-auth config (currently supports email/password or provider OAuth)

### Environment Setup

**Required env vars** (see `.env.example`):
- `DATABASE_URL` — Neon connection string (Postgres)
- `REDIS_URL` — Redis connection (optional for caching)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob API token
- `AUTH_SECRET` — Auth.js secret key
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway API key (for non-Vercel deployments)

**Optional**:
- `IS_DEMO=1` — Enable demo mode (adds `/demo` base path)
- `PLAYWRIGHT=True` — Enable e2e tests (set automatically by test runner)

**Local setup**:
```bash
npm i -g vercel               # Install Vercel CLI
vercel link                   # Link local repo to Vercel project
vercel env pull               # Download env vars from Vercel
pnpm install && pnpm dev      # Start local dev server
```

## Common Workflows

### Adding a New Database Migration

1. Modify schema in `lib/db/schema.ts`
2. Run `pnpm db:generate` to create migration file
3. Review migration in `lib/db/migrations/`
4. Run `pnpm db:migrate` to apply locally
5. Migration applies automatically on production deploy

### Adding a New LLM Tool

1. Define tool function in `lib/ai/tools/my-tool.ts` using AI SDK tool schema
2. Import and add to `toolSet` in `lib/ai/tools/index.ts`
3. Add type definition in `lib/types.ts` (ChatTools and CustomUIDataTypes)
4. Update system prompt in `lib/ai/prompts.ts` to document tool behavior
5. For streaming UI updates: use `streamUI.addUIEvent()` in tool handler

### Running E2E Tests

```bash
pnpm dev                      # Start dev server in background
pnpm test                     # Run Playwright tests (targets http://localhost:3000)
```

Tests run against a real running instance. Playwright config in `playwright.config.ts`:
- Timeout: 240 seconds per test
- Trace collection on failure
- HTML reporter: `playwright-report/`

### Debugging

- Biome errors: Run `pnpm fix` to auto-correct formatting/type issues
- Database issues: Use `pnpm db:studio` to inspect/modify Postgres directly
- AI responses: Check `lib/ai/models.ts` for active model config and `lib/ai/prompts.ts` for system prompt
- E2E flakiness: Increase timeout in `playwright.config.ts` or use Playwright's `test.slow()` for slower operations

## Code Patterns

### Server Components (React 19)

Default: use Server Components in `app/` routes. Fetch data directly in component bodies (no extra API layer needed).

```typescript
// app/(chat)/chat/[id]/page.tsx
export default async function ChatPage({ params }: { params: { id: string } }) {
  const chat = await getChat(params.id);  // Direct DB query
  return <ChatView chat={chat} />;
}
```

### Client Components

Use `"use client"` at the top for interactivity: form handlers, hooks, event listeners.

```typescript
// components/chat/chat-input.tsx
"use client";

export function ChatInput() {
  const [input, setInput] = useState("");
  return <input onChange={(e) => setInput(e.target.value)} />;
}
```

### Streaming AI Responses

Handled by AI SDK hooks on client, tool results stream back via `streamUI()`.

```typescript
// lib/ai/tools/create-document.ts
const tool = tool({
  description: "Create a document",
  execute: async (params) => {
    const docId = await db.artifacts.insert(...);
    streamUI.addUIEvent({ type: 'id', id: docId });
    return { success: true, id: docId };
  },
});
```

### Type-Safe Database Queries

Drizzle provides full type inference on insert/select/update.

```typescript
// lib/db/queries.ts
export async function getChat(id: string) {
  return db.select().from(chats).where(eq(chats.id, id)).limit(1);
}
```

## Performance Notes

- **React Compiler enabled**: Auto-memoization of components; no manual `useMemo`/`useCallback` needed unless overriding defaults
- **Cache Components**: Next.js 16 cache components via `cacheComponents: true` in config
- **Prefetch inlining**: Experimental prefetch optimization enabled
- **Artifact lazy loading**: Large documents (code, sheets) render preview-first, full content on demand
- **Redis caching**: Used for frequently accessed data (weather, user preferences, etc.)

## Linting & Code Quality

- **Formatter**: Biome (2 spaces, auto-formatting on save via editor integration)
- **Linter**: Biome with ultracite preset; disabled rules: `noExplicitAny`, `noConsole`, `useImageSize`, `noBarrelFile`, etc.
- **Command**: `pnpm check` to lint, `pnpm fix` to auto-correct

**Excluded from linting**:
- `components/ai-elements/` — Auto-generated by AI SDK
- `components/elements/` — Artifact renderers (dynamic content)
- `components/ui/` — shadcn/ui auto-managed
- `lib/utils.ts` — Utility re-exports from shadcn
- `hooks/use-mobile.ts` — Generated hook

## Known Constraints

- Middleware on Next.js 16 uses Vercel Functions (not Edge), so full Node.js available
- Auth.js 5.0 is beta; check release notes on updates
- Drizzle migrations are SQL-based; manual intervention may be needed for complex schema changes
- Vercel Blob: max file size depends on plan (check documentation)
- Redis optional but recommended for production caching
- Demo mode (`IS_DEMO=1`) redirects all traffic to `/demo` base path
