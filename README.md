<div align="center">

# Exile Terminal

A personalized, single-user **Path of Exile 2** command center: live economy, a unique-item tracker, and a tool-calling AI Oracle, in a dark "Arcane Ledger" interface.

Next.js 16 · React 19 · Tailwind v4 · TypeScript

</div>

## Areas
- **Overview**: live economy, market movers, your tracker, and the current league at a glance.
- **Character**: your gear, stats, and passive count from GGG (needs account access, see below).
- **Build Guides**: ask the Oracle what is winning; web-grounded and priced against live data.
- **Market**: full currency exchange with sparklines, categories, search, and pagination.
- **Uniques**: the full catalog with live prices, plus a have / want / chasing tracker.
- **Codex (Oracle)**: a tool-calling assistant over live prices, your tracker, and web search.
- **Patch Changes**: ask the Oracle what changed in the current patch.

## Data sources
- **poe2scout.com**: live currency and unique prices. No key needed.
- **Anthropic Claude API**: the Oracle and the Oracle-powered pages. Needs `ANTHROPIC_API_KEY`.
- **GGG character-window endpoints** (realm=poe2): the Character page. Needs a public profile or `POESESSID`.
- **Web search**: a server-side tool the Oracle uses for current-patch facts.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
```
The app is usable with no secrets at all: Overview, Market, and Uniques are live out of the box. The Oracle and Character areas light up once you add the config below.

## Configuration
Create `.env.local` (gitignored), or set these in your deployment environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | for AI features | Powers the Oracle, Build Guides, and Patch Changes. Get one at console.anthropic.com. |
| `ORACLE_MODEL` | optional | Oracle model. Defaults to `claude-opus-4-8`. Use `claude-sonnet-4-6` or `claude-haiku-4-5` to cut cost. |
| `POESESSID` | optional | pathofexile.com session cookie, for the Character page when your profile is private. |
| `NEXT_PUBLIC_POE_ACCOUNT` | optional | Account name. Defaults to `aurph`. |
| `NEXT_PUBLIC_POE_CHARACTER` | optional | Character name. Defaults to `alangreenspan`. |
| `NEXT_PUBLIC_POE_LEAGUE` | optional | Fallback league label. The live league is detected automatically. |

### Connecting your character
The Character page reads GGG's public character endpoints. Either set your profile to public at pathofexile.com privacy settings (simplest), or add `POESESSID` to keep it private.

## Deploy
Any Node host works:
```bash
npm install
npm run build
npm start
```
Set the environment variables above in your host's environment or secrets store.

## Notes
- Single user, no login. External data is cached in-process with a short TTL and falls back to the last good value on a failed fetch.

---

<div align="center">
By <a href="https://github.com/aurph">Jack Schwartz</a> (aurph). Built with <a href="https://claude.com/claude-code">Claude</a>.
</div>
