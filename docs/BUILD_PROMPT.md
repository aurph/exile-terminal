# PoE2 Assistant: Build Brief

You are building a personalized, single-user Path of Exile 2 (PoE2) command center web app. Build it in phases (see Section 12). Each phase must run on its own. Follow this brief precisely. Where it is silent, prefer simple, well-tested choices over clever ones.

## 1. Summary
A personal dashboard for one user (PoE2 account `aurph`, main character `alangreenspan`). Five areas: Home, Build Guides, Market, Uniques Tracker, Wiki + Ask. A tool-calling Claude assistant runs across all of them and fetches live data per question, so answers reflect the current patch rather than stale model memory. Current league at time of writing: "Rise of the Abyssal".

## 2. Who it is for
Single user. No login screen, no multi-tenant accounts. The user's identity (`aurph` / `alangreenspan`) comes from environment variables. Personalize copy and defaults to them.

## 3. Tech stack (required)
- Next.js (App Router) + TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3` for the local cache and the uniques tracker
- Anthropic SDK (`@anthropic-ai/sdk`) for the assistant and summaries
- Zod for validating every external API response
- Deployed on Replit. Read secrets from environment variables (Replit Secrets). Never commit secrets.

All Anthropic and OAuth calls happen server-side. No secrets in client code. Use server components and route handlers for data fetching.

## 4. Architecture
- **Cache-first.** Every external source is fetched on a schedule (or on demand with a TTL), validated with Zod, and stored in SQLite. The UI reads from SQLite, not directly from external APIs, so pages load instantly and we do not hammer third parties. Show a "data as of HH:MM" stamp wherever cached data is displayed.
- **Adapter isolation.** Each external source (poe.ninja, poe2db, GGG patch notes, GGG OAuth) lives behind one small adapter module with a typed interface. If an undocumented endpoint changes shape, it is a single-file fix. All outbound requests set a descriptive User-Agent: `poe2-assistant (contact: jacksch45@gmail.com)`.
- **Server-only secrets.** The Anthropic key and the GGG OAuth client secret are used only in server code.
- **Graceful degradation.** If a source is unavailable, fall back to the last good cached value and show a small "stale" indicator. The character module degrades to a "connect once approved" state until GGG OAuth is configured.

## 5. Data sources (concrete)
1. **poe.ninja PoE2 API (economy + builds).** Undocumented but stable JSON. Verified economy endpoint (GET):
   `https://poe.ninja/poe2/api/economy/currencyexchange/overview?leagueName=Rise%20of%20the%20Abyssal&overviewName=Currency`
   The response has `lines` and `items` arrays with fields like `id`, `primaryValue`, `secondaryValue`, and volume fields. Treat the league name as configurable (`POE_LEAGUE`). Find the matching builds/ladder endpoints by inspecting poe.ninja/poe2/builds network calls. Do not hardcode assumptions, validate every response with Zod, and keep it behind the adapter.
2. **poe2db.tw (game data).** Source for skills, support gems, the uniques catalog (names, art, mods, drop source), mechanics, and item bases. Powers the wiki, the uniques catalog, and the assistant's game-data lookups. Cache aggressively.
3. **GGG news / patch notes.** Fetch the latest PoE2 patch notes and league info from the official site. Have Claude condense them into the Home "what's new" digest. Cache the digest and refresh daily.
4. **GGG OAuth API (character data).** The official API exposes PoE2 characters via the Account Characters endpoint with `realm=poe2` (PoE2-specific item and socket fields). This needs a registered OAuth `client_id` from Grinding Gear Games (requested separately). Until `POE_OAUTH_CLIENT_ID` is set, the character module shows a "connect once approved" state and the rest of the app works normally. When configured, implement the OAuth 2.0 authorization-code flow server-side, store tokens in SQLite (server-side only), and pull `alangreenspan` (account `aurph`) characters, gear, and passives.
5. **Anthropic Claude API.** Powers the assistant and the patch-note summaries.

## 6. The assistant (tool-calling)
A chat box available from every area. Implement with Anthropic tool use in a server route. Claude decides which tools to call per question, then answers from the results.

Tools to expose (all server-side, each backed by an adapter + cache):
- `get_economy(query)`: currency rates and item values from poe.ninja.
- `lookup_game_data(entity)`: skills, uniques, mechanics, item bases from poe2db.
- `get_patch_notes(version?)`: latest patch and league notes.
- `get_meta_builds(filter?)`: popular and strong builds from poe.ninja build data.
- `search_uniques(filter)`: query the uniques catalog and the user's tracker, with live prices.
- `get_my_character()`: the user's character snapshot (live once OAuth is configured, otherwise a cached or manual snapshot).

Model tiering and cost control. Use these exact, current model IDs:
- Light routing and simple lookups: `claude-haiku-4-5-20251001`
- Default reasoning and answers: `claude-sonnet-4-6`
- Hard, multi-step reasoning when needed: `claude-opus-4-8`

Use prompt caching on the system prompt and tool definitions (they are stable) to cut cost and latency. Cap the tool-use loop (for example, 5 tool calls per question) and return an honest partial answer if the cap is hit. Stream responses to the UI.

Note to implementer: these are current Anthropic model IDs as of mid 2026. Do not substitute older IDs (such as claude-3-x). If the SDK rejects an ID, surface the error rather than silently downgrading.

## 7. The five areas (feature spec)
**Home.** Personalized greeting for `aurph`. The "what's new this patch" digest (Claude-summarized patch and league notes). A compact snapshot of `alangreenspan` (level, class, key stats; placeholder until OAuth). Two or three economy highlights (top movers, valuable currency). Everything stamped "data as of ...".

**Build Guides.** A browsable list of meta builds (from poe.ninja build data): class, main skill, popularity, rough cost tier, a one-line take. Click one to open a visual build card:
- Gear laid out like the in-game character panel, with item art and the key mods on each piece.
- Skill setup: the main skill gem plus its support gems, shown as links or groups.
- Ascendancy and the key passives, keystones, and notables as an icon list (NOT a full interactive tree).
- The passive tree shown as a key-node list and/or a static image, with an "open full tree in PoB / planner" link.
- Leveling notes and a short "how to play" section.
`alangreenspan` appears here as a build card once OAuth is configured.

**Market.** Economy view from poe.ninja: currency exchange rates, notable and valuable items, and simple trend indicators (up or down vs last refresh). Filter by category. "Data as of ..." stamp.

**Uniques Tracker (custom, important to the user).** Two parts:
- A browsable catalog of PoE2 uniques (from poe2db): art, full mods, base item, drop source, and current price (from poe.ninja).
- The user's personal tracker stored in SQLite: mark each unique as `have`, `want`, or `chasing`. Show live prices so the user sees what their `chasing` items cost and what their `have` items are worth. Sort and filter by status, price, and slot. This is a first-class feature; give it real screen space.

**Wiki + Ask.** A browsable reference of game data (skills, support gems, mechanics, item bases) backed by poe2db, plus the assistant chat box (Section 6) for free-form questions.

## 8. Look and feel
Dark, gothic-arcane to match PoE2. Near-black backgrounds, bone and parchment text, blood-red and antique-gold accents. A serif display face for headers, a clean sans for data and body. Respect PoE item rarity colors (unique = the classic orange-brown, rare = yellow, magic = blue, normal = white). Dense but legible "command center" layout, not a sparse marketing page. Plain, non-marketing copy throughout.

## 9. Data model (SQLite, sketch)
- `economy_snapshot(league, category, payload_json, fetched_at)`
- `meta_builds(league, payload_json, fetched_at)`
- `uniques_catalog(id, name, base, slot, mods_json, drop_source, art_url, updated_at)`
- `unique_prices(unique_id, league, price, currency, fetched_at)`
- `user_uniques(unique_id, status /* have | want | chasing */, note, updated_at)`
- `patch_digest(version, summary_md, fetched_at)`
- `character_snapshot(account, character, payload_json, fetched_at)`
- `oauth_tokens(account, access_token, refresh_token, expires_at)` (server-side only)

Keep raw API payloads as JSON plus a few indexed columns. Adjust as needed.

## 10. Error handling and resilience
- Every adapter: timeout, one or two retries with backoff, Zod validation, and fallback to last good cache on failure.
- Conservative refresh intervals (economy every 15 to 30 minutes, patch digest daily, catalog rarely). Never fetch on every page view; read cache.
- Descriptive User-Agent on all outbound requests.
- Assistant: capped tool loops, graceful handling of Anthropic rate limits and errors, honest partial answers.
- Surface staleness in the UI rather than failing the page.

## 11. Testing
- Test-driven where practical. For each adapter, record a real response as a fixture and test parsing and validation against the fixture, so tests never depend on live APIs.
- Mock the tools to test the assistant's routing and the tool-use loop (including the cap).
- Smoke-test that each page renders with seeded cache data.

## 12. Build order (ship each phase working)
1. Foundation: Next.js app, SQLite cache layer, adapter scaffolding, base dashboard shell and the look and feel.
2. Home + Market: economy adapter and patch digest. First visible value, no AI required.
3. Wiki + Ask: the tool-calling assistant with its tools.
4. Build Guides: meta list and the visual build card.
5. Uniques Tracker: catalog plus have/want/chasing plus live prices.
6. Character link: the GGG OAuth flow and live `alangreenspan` data. Do this last; it depends on external approval.

## 13. Out of scope for v1 (do not build)
- A full interactive passive skill tree renderer.
- Multi-user accounts or login.
- Payments or monetization.
- A native mobile app (responsive web is enough).

## 14. Environment variables
See `.env.example`. The app must run and be useful with only `ANTHROPIC_API_KEY` set (character features degrade gracefully). Personalization comes from `POE_ACCOUNT_NAME`, `POE_CHARACTER_NAME`, `POE_LEAGUE`. The character module (later) needs `POE_OAUTH_CLIENT_ID`, `POE_OAUTH_CLIENT_SECRET`, `POE_OAUTH_REDIRECT_URI`.

## 15. Acceptance criteria
- App boots on Replit with only `ANTHROPIC_API_KEY` set; all non-character areas work.
- Home shows a real "what's new" digest and live economy highlights with timestamps.
- Market shows current league currency and item data from poe.ninja.
- Build Guides lists meta builds and opens a visual card per the spec.
- Uniques Tracker browses the catalog and persists have/want/chasing in SQLite with live prices.
- Wiki + Ask answers a current-patch question by calling the right tool(s).
- No secrets in the client bundle or the repo.
