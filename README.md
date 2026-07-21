# ◤◢ BLACK OPS COMBAT RECORD — self-hosted terminal

A self-hosted web app linked to your PSN account that detects when you play
**Call of Duty: Black Ops 1 / 2**, auto-logs sessions, syncs trophies (with an
auto-completing campaign dossier), and ingests combat-record screenshots via
OCR — no manual typing.

Amber-phosphor CIA terminal dashboard included.

## What it automates

| Data | Source | Automation |
|---|---|---|
| "You're playing BO1/BO2 right now" | PSN presence API | Fully automatic — 60s poller creates timestamped sessions |
| Session length / play history | Presence polling | Fully automatic |
| Trophies + campaign checklist | PSN trophy API | Fully automatic — synced every 6h (and on demand) |
| Lifetime K/D, wins, losses | Combat Record screenshot | Semi-auto — drop a screenshot, OCR extracts and diffs vs last sync |
| Per-match / per-map stat lines | No API exists (Activision Elite shut down 2014) | End-of-match screenshot OCR — auto-classified, aggregated per map. Fully hands-off with the auto-ingest watcher below |

The accuracy backbone is **snapshot diffing**: two combat-record snapshots a
week apart give exact weekly K/D, games played, and win rate with zero
per-match entry.

## Quick start

```bash
npm install
cp .env.example .env      # then fill in NPSSO (see below)
npm run dev               # dev with hot reload
# open http://localhost:8080
```

Production:

```bash
npm run build && npm start
```

Want to see the dashboard populated before linking PSN?

```bash
npm run demo && npm run dev     # seeds realistic demo data (wipe with: rm -rf data/)
```

## Linking your PSN account (one-time, ~60 seconds)

1. Log in at https://www.playstation.com
2. In the same browser, visit https://ca.account.sony.com/api/v1/ssocookie
3. Copy the 64-character `npsso` value into `.env` as `NPSSO=...`
4. (Optional) set `PSN_ONLINE_ID=YourGamertag` — otherwise the token owner's
   own account is tracked.
5. Restart the app. The poller links immediately and starts sweeping presence.

Tokens are refreshed automatically; the NPSSO itself needs re-grabbing roughly
every 60 days (the dashboard's PSN LINK indicator goes red when that happens).

## OCR engines

- **Tesseract** (default, free, local) — parses the combat record's clean fonts
  with tuned label rules (`src/ocr/parse.ts`).
- **Claude vision** (more robust on game UI) — set `ANTHROPIC_API_KEY` in
  `.env`. With `OCR_ENGINE=auto` the app prefers Claude and falls back to
  Tesseract automatically. Model defaults to `claude-opus-4-8`
  (`CLAUDE_MODEL` to override).

The pipeline auto-detects what you gave it: a **lifetime combat record** screen
becomes a snapshot (for diffing), an **end-of-match / zombies game-over** screen
becomes a per-map match entry (map, mode, K/D, result, round) shown in the MAP
INTEL panel. Maps are matched against the full BO1/BO2 rosters (base + DLC).

### Zero-touch collection (auto-ingest)

There is no Activision API for BO1/BO2 — the Elite stat service shut down in
2014, and the modern CoD API starts at BO4. The closest thing to automatic
collection is the built-in watcher: set `AUTO_INGEST_DIR=./ingest-inbox` in
`.env` and point your capture pipeline at that folder —

- capture card / Elgato auto-save directory
- an OBS screenshot hotkey while playing via remote play or capture card
- a Dropbox / Syncthing / Nextcloud folder that your phone photos sync into
  (snap the TV at the end of a match, it files itself)

Every image that lands there is OCR'd, classified, recorded, and moved to
`processed/` (or `failed/` if unreadable). No clicks, no uploads.

Upload via the dashboard dropzone, or:

```bash
curl -X POST --data-binary @combat-record.png -H "Content-Type: image/png" \
  http://localhost:8080/api/upload
```

## Deploying

Needs to be running to catch presence events — a $5 VPS, Raspberry Pi, or your
PC all work.

**Docker (recommended):**

```bash
docker compose up -d --build
```

**Bare metal / Pi (systemd):** see `deploy/combat-record.service`.

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/status` | GET | PSN link state, active session, poller heartbeat |
| `/api/sessions` | GET | Session history + per-game time totals |
| `/api/trophies` | GET | Synced trophy list + earned summary |
| `/api/campaign` | GET | Campaign checklist (auto-derived from trophies) |
| `/api/snapshots` | GET | Lifetime stat snapshots (`?game=BO1`) |
| `/api/snapshots/diff` | GET | Diff of the two latest snapshots (`?game=BO2`) |
| `/api/upload` | POST | Raw image body → OCR → snapshot or match (auto-detected) |
| `/api/maps` | GET | Per-map aggregates: matches, K/D, W–L, best zombies round |
| `/api/match` | POST | Manual per-match stat entry |
| `/api/sync/trophies` | POST | Trigger trophy sync now |
| `/api/sync/presence` | POST | Trigger a presence sweep now |

## Architecture

```
PSN (Sony) ◄── poller (node-cron: presence 60s, trophies 6h) ──► SQLite
screenshot ──► OCR (Claude vision / Tesseract) ──► lifetime_snapshots ─┘
                                    │
                        Express + static dashboard (amber terminal)
```

Single Node.js process — API, poller, and dashboard together. SQLite lives in
`./data/` (mounted as a volume in Docker).

## Tests

```bash
npm test    # OCR parsing rules
```

## Risks / realities

- `psn-api` is unofficial — Sony tolerates it (PSNProfiles runs on the same
  approach) but could change endpoints.
- NPSSO needs re-grabbing ~every 60 days.
- Presence polling requires the worker to be running.
- Per-match granularity will never be API-perfect; snapshot diffing is the
  accuracy backbone.
