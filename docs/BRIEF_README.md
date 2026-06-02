# poe2-assistant

A personalized, single-user Path of Exile 2 command center for account `aurph` (main character `alangreenspan`). Dashboard with five areas (Home, Build Guides, Market, Uniques Tracker, Wiki + Ask) plus a tool-calling Claude assistant that fetches live data so it stays current with the patch.

This repo holds the build brief. The app is built by Replit's Agent from `BUILD_PROMPT.md`.

## Build it on Replit
1. Import this GitHub repo into Replit (Create App, then Import from GitHub).
2. Open the Agent and tell it: "Build this app following BUILD_PROMPT.md exactly. Start with phase 1 and keep each phase runnable."
3. Add Secrets (see `.env.example`). To start you only need `ANTHROPIC_API_KEY`. Everything except the character module works without the GGG OAuth values.
4. Run, then iterate with the Agent phase by phase.

## Stack
Next.js (App Router) + TypeScript, Tailwind, SQLite (better-sqlite3), Anthropic SDK, Zod. Deployed on Replit.

## Action needed: GGG OAuth (character module only)
The live character data (gear, passives, stats for `alangreenspan`) needs an OAuth client registered with Grinding Gear Games. This has lead time, so request it now. Draft email to send to oauth@grindinggear.com:

> Subject: OAuth application registration request (PoE2 personal tool)
>
> Hi,
>
> I would like to register an OAuth client for a personal, single-user Path of Exile 2 dashboard. It would use the Account Characters endpoint (realm=poe2) to display my own characters' gear and passives. It is not a public or commercial service, only my own account (aurph).
>
> Could you let me know how to register a client and which scopes to request? The redirect URI will be my Replit app URL, which I can provide.
>
> Thanks,
> Jack (account: aurph)

Everything else in the app works without this.

## Notes
- Single user, no login. Personalization comes from environment variables.
- All external data is cached in SQLite and stamped with a fetch time. Adapters validate responses with Zod and fall back to cache on failure.
- Data sources: poe.ninja (economy and builds), poe2db.tw (game data and uniques), GGG (patch notes and OAuth character data).
