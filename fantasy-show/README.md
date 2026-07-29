# GRIDIRON EGOS — a weekly fantasy football recap cartoon

An animated web series recapping the squad's fantasy week. Each episode is a
~5–7 minute cartoon with voice acting (browser text-to-speech), animated SVG
puppet characters in their real teams' colors, speech bubbles, broadcast-style
lower thirds, a scorebug, and an animated box score.

## Watch

- **Season hub:** open `index.html`
- **Episode 1 (Week 1 — “Won by a Foot”):** open `watch/week01.html`
- **Single-file build** (share it anywhere, no other files needed): `dist/week01.html`

No server or dependencies required — every page works straight off the
filesystem. Sound and voices start after you press **START THE EPISODE**
(browsers require a click before audio).

Controls: space = play/pause · ←/→ = previous/next scene · 🎙 toggles voice
acting · 🔊 toggles crowd/sound effects · click any progress segment to jump.

## The squad (Week 1)

| Slot | Player | Team | Pts |
|------|--------|------|----:|
| QB   | Josh Allen | Bills | 29 |
| RB1  | Jahmyr Gibbs | Lions | 33 |
| RB2  | Kenneth Gainwell | Buccaneers | 19 |
| WR1  | Davante Adams | Rams | 20 |
| WR2  | Nico Collins | Texans | 18 |
| TE   | Harold Fannin Jr. | Browns | 16 |
| FLEX | Jadarian Price | Seahawks | 30 |
| K    | Brandon Aubrey | Cowboys | 22 |
| DEF  | Broncos | Denver | 14 |

Final: **201–198** (a 3-point win — exactly one Aubrey field goal, as he will
remind everyone forever).

## How the series works

```
fantasy-show/
├── engine/            shared cartoon engine (used by every episode)
│   ├── characters.js  SVG puppet library — one spec per squad member
│   ├── engine.js      playback: scenes, bubbles, TTS voices, overlays
│   └── show.css       broadcast chrome + stage styling
├── episodes/
│   └── week01.js      EPISODE DATA — the script, stats and scenes
├── watch/
│   └── week01.html    thin page that loads engine + episode data
├── dist/
│   └── week01.html    self-contained single-file build (committed)
└── build.js           inliner: node build.js week01
```

### Adding next week's episode

1. Copy `episodes/week01.js` → `episodes/week02.js` and update:
   - `week`, `episode`, `title`, `tagline`, `result` (scores + rival name),
   - each roster entry's `pts` (and `badge` for the week's honors),
   - the `scenes` array — the new week's script,
   - `nextWeekTease`.
2. Copy `watch/week01.html` → `watch/week02.html` and change the one
   `episodes/week01.js` script tag to `week02.js`.
3. `node build.js week02` → `dist/week02.html`.
4. Add a card for it in `index.html`.

Or just tell Claude the week's box score (who scored what, final score, W/L)
and ask for the next episode — that's the intended workflow.

### Episode data format

```js
window.EPISODE = {
  series, episode, week, title, tagline, nextWeekTease,
  result: { us, them, teamName, teamAbbr, rivalName, rivalAbbr },
  roster: [ { id, name, short, pos, pts, badge? }, ... ],
  scenes: [
    { setting,          // scoreboard | locker_room | press_room |
                        // film_room | field | hallway
      title,            // scene-title chip text
      overlay?,         // 'finalScore' | 'statBoard' animated overlays
      cast?,            // optional explicit puppet lineup (defaults to speakers)
      lines: [ { s, t, m }, ... ]   // speaker id, text, mood
    }, ...
  ],
}
```

Speaker ids: `NARRATOR, ALLEN, GIBBS, GAINWELL, ADAMS, COLLINS, FANNIN,
PRICE, AUBREY, BRONCOS`. Moods: `brag, smack, humble, hype, deadpan, laugh,
angry, nervous, neutral` — they drive brows, arm gestures, mouth shape and
bubble styling.

Characters live on their **current (2026) NFL teams** — if someone gets
traded, update their colors/number in `engine/characters.js` (`SPECS`).
