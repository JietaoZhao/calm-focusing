

# Calm — Pomodoro & Hydration Timer for Office Workers

## Overview
A single-page productivity timer app with Pomodoro clock, work schedule awareness (9-5 with lunch break), and drinking water reminders. Minimal, science-illustration style with Morandi color palette and TeX Gyre Termes font.

## Design System

**Font**: TeX Gyre Termes via CDNFonts  
**Morandi Palette (HSL)**:
- Background: warm off-white `hsl(20, 30%, 96%)`
- Primary (deep sage): `hsl(155, 15%, 42%)` — `#6c8f7e`
- Secondary (soft blue): `hsl(205, 25%, 72%)` — `#96a6c0`  
- Accent (dusty rose): `hsl(8, 40%, 88%)` — `#f0d5d0`
- Muted (warm gray): `hsl(210, 5%, 69%)` — `#acb1b4`
- Text: `hsl(220, 15%, 25%)`

**Style**: Thin line borders, subtle shadows, rounded containers. Clean scientific-diagram feel — think thin circular progress rings, minimal icons, generous whitespace.

## App Structure

### Single page with 3 sections:

**1. Header**
- App name "Calm" in TeX Gyre Termes
- Subtle tagline: "Focus. Breathe. Hydrate."

**2. Main Timer Area**
- Large circular progress ring (SVG) showing current timer
- Timer display (MM:SS) in center
- Status label: "Focus" / "Short Break" / "Long Break" / "Hydrate"
- Start / Pause / Reset buttons below

**3. Settings Panel** (collapsible or side section)
- **Mode toggle**: Simple Pomodoro vs. Work Schedule
- **Simple Pomodoro**: Focus duration (25 min default), short break (5 min), long break (15 min), sessions before long break (4)
- **Work Schedule mode**: Start time, end time, lunch break time & duration → auto-calculates pomodoro sessions
- **Water Reminder**: Toggle on/off, number of glasses (e.g. 8) → evenly distributes reminders across work period
- **Coffee Treat**: A small heart/coffee icon link → opens a "Buy me a coffee" style dialog with author's payment link (placeholder URL)

## Technical Plan

### Files to create/modify:

1. **`index.html`** — Add CDNFonts link for TeX Gyre Termes
2. **`src/index.css`** — Update CSS variables to Morandi palette, set font-family
3. **`src/pages/Index.tsx`** — Main app layout with header, timer, settings
4. **`src/components/Timer.tsx`** — Circular SVG timer with start/pause/reset, state machine (focus → break → focus...)
5. **`src/components/TimerRing.tsx`** — SVG circular progress component
6. **`src/components/Settings.tsx`** — Settings panel with mode selection, duration inputs, water reminder config
7. **`src/components/WaterReminder.tsx`** — Water tracking display (glasses filled/remaining)
8. **`src/components/CoffeeTreat.tsx`** — "Treat the author" dialog/modal

### Timer Logic:
- Use `useEffect` + `setInterval` for countdown
- State: `mode` (focus/shortBreak/longBreak), `timeRemaining`, `isRunning`, `completedSessions`
- Work Schedule mode: calculate total available minutes (minus lunch), divide into pomodoro cycles
- Water reminders: divide work period by glass count, trigger notification (toast) at intervals
- Audio notification (browser `Audio` API) for timer completion and water reminders

### State Management:
- All state via React `useState`/`useReducer` in Index page
- Persist settings to `localStorage`
- No backend needed

