

# Short Break Suggestions with Tooltip Details

## What It Does
When the timer is in `shortBreak` mode, display three suggestion items just below the time numbers (inside the timer ring). Each item has a label and a small `!` icon that reveals detailed tips on hover via a tooltip.

## Suggestions Data
1. **Visual & Eye Relaxation** — tooltip: look out window, watch greenery, sky gazing
2. **Body Reset** — tooltip: neck/shoulder rolls, stretch, squats/pushups, walk around
3. **Breathing Control** — tooltip: 5s inhale, 5s hold, 5s exhale, cycle 3-5x, stress reduction note

## Technical Changes

### `src/components/Timer.tsx`
- Import `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`
- Import `Info` icon from lucide-react (small `!`-style icon)
- Define a `BREAK_SUGGESTIONS` array with `{ label, tips[] }` objects
- Below the time display (`formatTime`), when `mode === "shortBreak"`, render the three suggestions as a compact list
- Each item: label text + small `Info` icon wrapped in a Tooltip showing the tips as a bulleted list
- Style: small text (`text-[10px]`), muted colors, compact spacing to fit inside the ring

### `src/App.tsx`
- Wrap the app (or at least the Timer area) with `<TooltipProvider>` if not already present

