# Galaxian‑Style **Mobile** Web App – Technical Design (Draft v0.2)

> **Purpose of this revision:** incorporate smartphone‑first layout and the four‑screen game flow (Start → Game → Result → Short Movie) requested on 10 July 2025.

---

## 1. Goal

- Build a *very* simple, Galaxian‑inspired shooter optimised for **smartphone browsers** (portrait orientation, touch controls).
- All on‑screen text appears **in English only**.
- Deploy automatically to **GitHub Pages** so that anyone can scan a QR code and play.

---

## 2. Technology Stack (unchanged)

| Layer                | Choice                                   | Rationale                              |
| -------------------- | ---------------------------------------- | -------------------------------------- |
| Language             | **TypeScript 5** (ES2020)                | Safer code, editors auto‑suggest       |
| Runtime              | **Node.js 20 LTS**                       | CI runners + local parity              |
| Package Manager      | **pnpm 9**                               | Fast + deterministic                   |
| Dev Server & Bundler | **Vite 5**                               | Instant HMR, effortless static export  |
| Rendering            | **HTML5 Canvas 2D**                      | Lightweight, perfect for retro shooter |
| UI Overlay           | **DOM + Tailwind CSS**                   | Quickly style fixed bottom buttons     |
| Testing              | **Vitest** (unit) & **Playwright** (e2e) | Browser + input automation             |
| Offline              | **Workbox** (optional PWA)               | Add "Add to Home Screen" later         |

---

### 2.1 Mobile UI Layout

```
┌───────────────────────────────┐
│           Canvas              │ ← fills ~80 vh, centres horizontally
├───────────────────────────────┤
│ ◀       SHOOT       ▶ │ ← flex row, fixed at bottom (z‑index above canvas)
└───────────────────────────────┘
```

- **Left (◀) & Right (▶) buttons**: hold = continuous move.
- **SHOOT button** (centre, larger): tap/hold to fire.
- Buttons implemented as `<button>` elements (`pointer:none` on canvas below to avoid ghost clicks).

---

### 2.2 Preventing Accidental Browser Navigation on Mobile

| Concern                                   | Counter‑measure                                                                                                    | Notes                                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Back/Forward edge‑swipe (iOS/Android)** | Trigger **Fullscreen API** (`canvas.requestFullscreen()`) as soon as the player taps **SHOOT** on the Start screen | Full‑screen mode captures most edge gestures; user can still exit with a system swipe, which is acceptable.                           |
| **Pull‑to‑refresh (Chrome Android)**      | `html, body { overscroll-behavior-y: contain; }`                                                                   | Prevents vertical overscroll chaining, disabling refresh while still allowing in‑game scrolling if needed.                            |
| **Scroll/drag causing page movement**     | `touch-action: none;` on the `<canvas>` and `<div id="controls">` wrapper                                          | Gives full control of pointer events to the game loop; we re‑implement only the gestures we want.                                     |
| **Double‑tap zoom / pinch**               | `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">`             | Locks viewport scale; recommended for fixed‑pixel canvas games.                                                                       |
| **Accidental reload (⌘R / ⟳)**            | `window.addEventListener("beforeunload", e => { if (gameInProgress) e.preventDefault(); });`                       | Shows native "Are you sure?" dialog on desktop; mobile browsers silently ignore but users rarely hit reload when game is full‑screen. |

> These CSS rules & listeners are lightweight and can be set globally in `index.css` and `main.ts`.

---

## 3. Repository Layout (excerpt)

```
public/
  └─ video/          # 10‑second MP4/WebM short movie
src/
  ├─ assets/         # sprites, explosion sheet, sfx
  ├─ ui/             # BottomControls.tsx (if using Preact) or vanilla TS module
  └─ scenes/
      ├─ Start.ts
      ├─ Game.ts
      ├─ Result.ts
      └─ ShortMovie.ts
```

---

## 4. Game Flow & State Details

| State          | Trigger In           | Trigger Out         | Visible Elements                                                                                                              |
| -------------- | -------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Start**      | App load / movie end | Tap **SHOOT**       | Canvas title: *"STAR SHOOTER"* (placeholder). Sub‑caption: *"Tap SHOOT to start"*. Bottom controls already shown (intuitive). |
| **Game**       | Start state exits    | Either target HP→0  | Two targets side‑by‑side; player ship bottom‑centre; HP bars optional; explosion sprite when destroyed.                       |
| **Result**     | Game exits           | 5 s timeout         | Text centred: *"You destroyed the LEFT target!"* (or RIGHT). Countdown not shown; after 5 s auto‑advance.                     |
| **ShortMovie** | Result exits         | Movie ended (≈10 s) | Autoplay muted video element over canvas or inside it; remove bottom buttons while playing.                                   |

Additional logic:

- Each **target** starts with `hp = 10`; each successful hit decrements by 1.
- **Collision detection:** simple rectangle vs projectile.
- Only the *first* target breached ends the round; the other stays inert.

---

## 5. Core Architecture Recap

1. **Game Loop** – fixed‑timestep (60 FPS) update inside `requestAnimationFrame`; separate render pass.
2. **Entity System** – minimalist component objects (`position`, `velocity`, `sprite`, `hp`).
3. **Input Layer** – `pointerdown / pointerup` events on the three overlay buttons update global `inputState` consumed each frame.
4. **Assets**
   - *player.png* (32×32)
   - *target.png* (48×48)
   - *explosion.png* (8‑frame strip)
   - *shot.wav*, *explosion.wav*
   - *short‑movie.webm* (≤1 MB, 10 s)

---

## 6. Local Dev Workflow

```bash
pnpm create vite galaxian-mobile --template vanilla-ts
cd galaxian-mobile
pnpm install
pnpm run dev     # launches https://localhost:5173 on device
```

For live testing on a physical phone: `vite --host` exposes LAN IP; QR code extension recommended.

---

## 7. GitHub Actions Deployment (unchanged)

`peaceiris/actions-gh-pages@v4` publishes `/dist` to Pages.\
URLs with hash routing (`/#/start`) avoid 404 on reload.

---

## 8. Development Milestones (updated)

| Tag    | What’s Done                                                     |
| ------ | --------------------------------------------------------------- |
| **M0** | Repo + CI green, blank canvas + bottom buttons responsive       |
| **M1** | Start screen implemented; touch starts game                     |
| **M2** | Player movement + shooting + shot collision                     |
| **M3** | Target HP logic, explosion sprite, transition to Result         |
| **M4** | Result screen auto‑timer, short movie playback                  |
| **M5** | Mobile polish: sound, vibration API on hit, lighthouse PWA pass |
| **M6** | Release v1.0 on GitHub Pages                                    |

---

## 9. Licensing & Attribution

- Code: **MIT**.
- Sprite/audio assets: CC‑BY 4.0 or created in‑house – document sources.
- The name *Galaxian* remains Bandai Namco’s trademark; project is a hobby remake.

---

> **Next actions:**\
> • Approve UI layout & state flow.\
> • Decide final game title, sprite style, and short‑movie concept.\
> • Kick‑off Milestone M0.

