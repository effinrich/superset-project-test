# Copilot instructions

## Build, test, and lint commands

- `pnpm install`
- `pnpm dev` starts the Next.js app with Turbopack.
- `pnpm check` runs the Ultracite/Biome checks.
- `pnpm fix` applies Ultracite fixes.
- `pnpm build` runs `tsx lib/db/migrate` before `next build`. If `POSTGRES_URL` is unset, the migration step exits early and the build continues.
- `pnpm test` runs the Playwright suite with `PLAYWRIGHT=True`.
- Run one Playwright file with `pnpm exec playwright test tests/e2e/chat.test.ts`.
- Run one Playwright test with `pnpm exec playwright test tests/e2e/chat.test.ts -g "home page loads with input field"`.
- Playwright starts the app through `playwright.config.ts`, targets `tests/e2e/**/*.test.ts`, reuses an existing dev server outside CI, collects traces on failure, and writes the HTML report to `playwright-report/`.
- If Playwright browsers are not installed in the local environment, run `pnpm exec playwright install`.
- Database utilities are exposed as `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:push`, `pnpm db:pull`, `pnpm db:check`, `pnpm db:up`, and `pnpm db:studio`.
- README.md expects env values from `.env.example`; for Vercel-backed setups it recommends `vercel env pull`.

## High-level architecture

- This is a Next.js 16 App Router app. The primary product lives under `app/(chat)` and auth lives under `app/(auth)`.
- `app/(chat)/layout.tsx` is the real chat shell entrypoint: it loads the sidebar, toast system, artifact pane, data-stream provider, and active-chat context. `app/(chat)/page.tsx` itself returns `null`.
- `hooks/use-active-chat.tsx` is the main client orchestration layer. It generates chat IDs before persistence, hydrates messages and votes with SWR, drives `@ai-sdk/react` `useChat`, resumes interrupted streams, and keeps the selected model in a cookie.
- `app/(chat)/api/chat/route.ts` is the central server flow for chat. It authenticates the user, enforces rate limits and entitlements, validates the selected model, builds the AI SDK stream, wires in tool calls, streams UI message parts back to the client, and persists chats/messages/titles/stream IDs.
- Model configuration lives in `lib/ai/models.ts`, prompt/tool/provider wiring lives in `lib/ai/*`, and `/api/models` exposes model capabilities to the UI.
- Persistence is centralized in `lib/db/queries.ts` over the Drizzle schema in `lib/db/schema.ts`. Main tables are `User`, `Chat`, `Message_v2`, `Vote_v2`, `Document`, `Suggestion`, and `Stream`.
- Artifact generation/editing is split by kind under `artifacts/<kind>/client.tsx` and `artifacts/<kind>/server.ts`, then registered in `lib/artifacts/server.ts`.
- Artifact editing/rendering spans `artifacts/*` and `lib/editor/*`: ProseMirror powers rich-text suggestions, CodeMirror powers code artifacts, and sheet artifacts have their own client/server handlers.
- Documents are versioned: `Document` uses a composite primary key of `(id, createdAt)`, and suggestions reference a specific document version.
- Auth uses NextAuth credentials plus a guest provider in `app/(auth)/auth.ts`. `proxy.ts` redirects anonymous traffic to the guest auth route, so most app flows assume there is always a guest or regular session.

## Key conventions

- Prefix app-internal links, redirects, and fetches with `process.env.NEXT_PUBLIC_BASE_PATH ?? ""`. Demo mode sets this through `IS_DEMO`, and the pattern is used across auth, chat, history, document, and vote flows.
- Prefer `ChatbotError` for API failures and return `error.toResponse()` from route handlers. Client helpers in `lib/utils.ts` expect the `{ code, message, cause }` error shape.
- Keep database access in `lib/db/queries.ts`; route handlers and server actions call query helpers instead of issuing inline Drizzle queries.
- Preserve the AI SDK message-part shape in storage. Messages are saved with `parts` JSON and converted back for the UI with `convertToUIMessages`.
- Test mode is environment-driven. If `PLAYWRIGHT`, `PLAYWRIGHT_TEST_BASE_URL`, or `CI_PLAYWRIGHT` is set, `lib/ai/providers.ts` swaps the app to mocked language models.
- Chat UI refactors should preserve existing `data-testid` hooks. The Playwright suite and `tests/pages/chat.ts` page object rely on selectors like `multimodal-input`, `send-button`, `stop-button`, `suggested-actions`, and `model-selector`.
- Artifact kinds are registry-driven. Adding a new kind requires updating the artifact implementation, the `artifactKinds`/`documentHandlersByArtifactKind` registry, and any schema or API validation that enumerates kinds.
