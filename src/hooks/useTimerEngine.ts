import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerMode } from "@/components/Timer";
import type { SettingsData } from "@/components/Settings";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "calm-settings";
const WATER_STORAGE_KEY = "calm-water";
const TIMER_STATE_KEY = "calm-timer-state";

const defaultSettings: SettingsData = {
  mode: "simple",
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLong: 4,
  workStart: "09:00",
  workEnd: "17:00",
  lunchStart: "12:00",
  lunchDuration: 60,
  waterEnabled: true,
  waterGlasses: 8,
};

function loadSettings(): SettingsData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {}
  return defaultSettings;
}

function loadWater(): number {
  try {
    const saved = localStorage.getItem(WATER_STORAGE_KEY);
    if (saved) {
      const { count, date } = JSON.parse(saved);
      if (date === new Date().toDateString()) return count;
    }
  } catch {}
  return 0;
}

function saveWater(count: number) {
  localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify({ count, date: new Date().toDateString() }));
}

interface TimerState {
  endTime: number; // absolute timestamp when timer ends
  mode: TimerMode;
  totalTime: number;
  completedSessions: number;
  pauseCount: number;
  pauseReasons: string[];
}

function saveTimerState(state: TimerState | null) {
  if (state) {
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(TIMER_STATE_KEY);
  }
}

function loadTimerState(): TimerState | null {
  try {
    const saved = localStorage.getItem(TIMER_STATE_KEY);
    if (!saved) return null;
    const state: TimerState = JSON.parse(saved);
    // Only restore if the end time is in the future
    if (state.endTime > Date.now()) return state;
    // Expired — clean up
    localStorage.removeItem(TIMER_STATE_KEY);
  } catch {}
  return null;
}

function getModeDuration(mode: TimerMode, settings: SettingsData): number {
  switch (mode) {
    case "focus": return settings.focusMinutes * 60;
    case "shortBreak": return settings.shortBreakMinutes * 60;
    case "longBreak": return settings.longBreakMinutes * 60;
  }
}

function calculateWorkMinutes(settings: SettingsData): number {
  const [sh, sm] = settings.workStart.split(":").map(Number);
  const [eh, em] = settings.workEnd.split(":").map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  return totalMin - settings.lunchDuration;
}

export function useTimerEngine() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);

  // Restore running timer from localStorage if the tab was discarded
  const restoredState = useRef(loadTimerState());

  const [mode, setMode] = useState<TimerMode>(() =>
    restoredState.current?.mode ?? "focus"
  );
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (restoredState.current) {
      return Math.max(0, Math.round((restoredState.current.endTime - Date.now()) / 1000));
    }
    return getModeDuration("focus", loadSettings());
  });
  const [totalTime, setTotalTime] = useState(() =>
    restoredState.current?.totalTime ?? getModeDuration("focus", loadSettings())
  );
  const [isRunning, setIsRunning] = useState(() => !!restoredState.current);
  const [completedSessions, setCompletedSessions] = useState(() =>
    restoredState.current?.completedSessions ?? 0
  );
  const [waterDrank, setWaterDrank] = useState(loadWater);
  const [pauseCount, setPauseCount] = useState(() =>
    restoredState.current?.pauseCount ?? 0
  );
  const [pauseReasons, setPauseReasons] = useState<string[]>(() =>
    restoredState.current?.pauseReasons ?? []
  );

  // Wall-clock refs for accurate background timing
  const endTimeRef = useRef<number>(restoredState.current?.endTime ?? 0);
  const waterLastReminderRef = useRef<number>(Date.now());

  // Use refs for values needed in callbacks to avoid stale closures
  const modeRef = useRef(mode);
  const completedSessionsRef = useRef(completedSessions);
  const settingsRef = useRef(settings);
  const waterDrankRef = useRef(waterDrank);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { completedSessionsRef.current = completedSessions; }, [completedSessions]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { waterDrankRef.current = waterDrank; }, [waterDrank]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const playEndSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, now + i * 0.3);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.3 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 1.2);
        osc.start(now + i * 0.3);
        osc.stop(now + i * 0.3 + 1.2);
      });
    } catch {}
  }, []);

  const playWaterSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }, []);

  const handleTimerEnd = useCallback(() => {
    playEndSound();
    setIsRunning(false);
    setPauseCount(0);
    setPauseReasons([]);

    const currentMode = modeRef.current;
    const currentCompleted = completedSessionsRef.current;
    const currentSettings = settingsRef.current;

    if (currentMode === "focus") {
      const newCompleted = currentCompleted + 1;
      setCompletedSessions(newCompleted);

      if (newCompleted % currentSettings.sessionsBeforeLong === 0) {
        const nextMode = "longBreak";
        const duration = getModeDuration(nextMode, currentSettings);
        setMode(nextMode);
        setTimeRemaining(duration);
        setTotalTime(duration);
        toast({ title: "🎉 Long break!", description: "Great work! Take a longer rest." });
        sendNotification("🎉 Long break!", "Great work! Take a longer rest.");
      } else {
        const nextMode = "shortBreak";
        const duration = getModeDuration(nextMode, currentSettings);
        setMode(nextMode);
        setTimeRemaining(duration);
        setTotalTime(duration);
        toast({ title: "☕ Short break", description: "Stretch, breathe, relax." });
        sendNotification("☕ Short break", "Stretch, breathe, relax.");
      }
    } else {
      const duration = getModeDuration("focus", currentSettings);
      setMode("focus");
      setTimeRemaining(duration);
      setTotalTime(duration);
      toast({ title: "🎯 Focus time", description: "Let's get back to work!" });
      sendNotification("🎯 Focus time", "Let's get back to work!");
    }
  }, [playEndSound, sendNotification]);

  // ─── Wall-clock timer: survives background tab throttling ───
  useEffect(() => {
    if (!isRunning) return;

    // Set the absolute end time when we start running
    endTimeRef.current = Date.now() + timeRemaining * 1000;

    const tick = () => {
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeRemaining(0);
        handleTimerEnd();
      } else {
        setTimeRemaining(remaining);
      }
    };

    // Use 1s interval but calculate from wall clock each tick
    const interval = setInterval(tick, 1000);

    // Also tick on visibility change (user returns to tab)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // Only re-run when isRunning changes (not timeRemaining — that's handled by wall clock)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, handleTimerEnd]);

  // ─── Water reminder: independent wall-clock scheduler ───
  useEffect(() => {
    if (!settings.waterEnabled) return;

    // Calculate interval between reminders
    const workMinutes = settings.mode === "schedule"
      ? calculateWorkMinutes(settings)
      : settings.focusMinutes * settings.sessionsBeforeLong * 2;

    const intervalMs = (workMinutes / settings.waterGlasses) * 60 * 1000;
    if (intervalMs < 60000) return; // min 1 min

    // Reset the last reminder time when settings change
    waterLastReminderRef.current = Date.now();

    const check = () => {
      const now = Date.now();
      const elapsed = now - waterLastReminderRef.current;
      const currentWater = waterDrankRef.current;
      const currentSettings = settingsRef.current;

      if (elapsed >= intervalMs && currentWater < currentSettings.waterGlasses) {
        waterLastReminderRef.current = now;
        playWaterSound();
        toast({
          title: "💧 Time to hydrate!",
          description: `Glass ${currentWater + 1} of ${currentSettings.waterGlasses}`,
        });
        sendNotification("💧 Time to hydrate!", `Glass ${currentWater + 1} of ${currentSettings.waterGlasses}`);
      }
    };

    // Check every 30s (cheap check against wall clock)
    const interval = setInterval(check, 30000);

    // Also check on visibility change (catches reminders missed while in background)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [settings.waterEnabled, settings.waterGlasses, settings.mode, settings.focusMinutes, settings.sessionsBeforeLong, playWaterSound, sendNotification]);

  const updateSettings = useCallback((newSettings: SettingsData) => {
    setSettings(newSettings);
    if (!isRunning) {
      const duration = getModeDuration(mode, newSettings);
      setTimeRemaining(duration);
      setTotalTime(duration);
    }
  }, [isRunning, mode]);

  const start = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const pause = () => {
    setPauseCount((c) => c + 1);
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setPauseCount(0);
    setPauseReasons([]);
    const duration = getModeDuration(mode, settings);
    setTimeRemaining(duration);
    setTotalTime(duration);
  };

  const pauseWithReason = (reason: string) => {
    setPauseCount((c) => c + 1);
    setPauseReasons((prev) => [...prev, reason]);
    setIsRunning(false);
  };

  const skip = () => {
    setIsRunning(false);
    handleTimerEnd();
  };

  const drinkWater = () => {
    const next = waterDrank + 1;
    setWaterDrank(next);
    saveWater(next);
  };

  return {
    settings,
    updateSettings,
    mode,
    timeRemaining,
    totalTime,
    isRunning,
    completedSessions,
    waterDrank,
    pauseCount,
    pauseReasons,
    start,
    pause,
    reset,
    skip,
    drinkWater,
    pauseWithReason,
  };
}
