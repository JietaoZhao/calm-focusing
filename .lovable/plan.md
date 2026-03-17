

# Focusing Helper — Pause Tracking Feature

## What It Does
- Counts pause events during a focus session
- After 2+ pauses, shows a dialog asking "Focusing Helper: What difficulties did you encounter?"
- Four professional options:
  1. **Restroom Break** — timer keeps running (auto-resumes)
  2. **Virtual Meeting** (Slack / Teams / Zoom)
  3. **In-Person Meeting**
  4. **Other Interruption**
- Option 1 doesn't pause; options 2–4 pause the timer and log the reason below the countdown
- Logged reasons persist until the session completes or resets

## Display
Inside the timer ring, below the time:
```
24:59
Focusing Helper:
· Paused for virtual meeting
· Paused for other interruption
```
Small text, muted color, left-aligned list.

## Technical Changes

### 1. `useTimerEngine.ts`
- Add state: `pauseCount: number`, `pauseReasons: string[]`
- Reset both when mode changes (in `handleTimerEnd`) or on `reset`
- New `pauseWithReason(reason: string)` function that logs reason + pauses
- New `pauseCountRef` to track count across the session
- Export `pauseCount`, `pauseReasons`, `pauseWithReason`

### 2. `Timer.tsx`
- Add props: `pauseCount`, `pauseReasons`, `onPauseWithReason`
- Intercept the pause button: if `pauseCount >= 2` and mode is `focus`, show a dialog instead of direct pause
- Display pause reasons list below the time inside `TimerRing` children
- Dialog with 4 buttons; "Restroom Break" just closes dialog (timer stays running), others call `onPauseWithReason(reason)`

### 3. `Index.tsx`
- Pass new props from engine to Timer

### Button Labels (Professional)
| User's term | Professional label |
|---|---|
| Restroom | Restroom Break |
| Meetings (Slack/Teams/Zoom) | Virtual Meeting |
| Meetings in person | In-Person Meeting |
| Others | Other Interruption |

