import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerMode } from "@/components/Timer";
import type { SettingsData } from "@/components/Settings";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "calm-settings";
const WATER_STORAGE_KEY = "calm-water";

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

function getModeDuration(mode: TimerMode, settings: SettingsData): number {
  switch (mode) {
    case "focus": return settings.focusMinutes * 60;
    case "shortBreak": return settings.shortBreakMinutes * 60;
    case "longBreak": return settings.longBreakMinutes * 60;
  }
}

export function useTimerEngine() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeRemaining, setTimeRemaining] = useState(() => getModeDuration("focus", loadSettings()));
  const [totalTime, setTotalTime] = useState(() => getModeDuration("focus", loadSettings()));
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [waterDrank, setWaterDrank] = useState(loadWater);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [pauseReasons, setPauseReasons] = useState<string[]>([]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode, completedSessions]);

  // Water reminder interval
  useEffect(() => {
    if (!settings.waterEnabled || !isRunning || mode !== "focus") return;
    
    // Calculate interval: distribute reminders across work period
    const workMinutes = settings.mode === "schedule"
      ? calculateWorkMinutes(settings)
      : settings.focusMinutes * settings.sessionsBeforeLong * 2; // rough estimate
    
    const intervalMs = (workMinutes / settings.waterGlasses) * 60 * 1000;
    if (intervalMs < 60000) return; // min 1 min

    const timer = setInterval(() => {
      if (waterDrank < settings.waterGlasses) {
        toast({
          title: "💧 Time to hydrate!",
          description: `Glass ${waterDrank + 1} of ${settings.waterGlasses}`,
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.waterEnabled, isRunning, mode, waterDrank, settings.waterGlasses]);

  const handleTimerEnd = useCallback(() => {
    // Play notification sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.stop(ctx.currentTime + 1.5);
    } catch {}

    setIsRunning(false);
    setPauseCount(0);
    setPauseReasons([]);

    if (mode === "focus") {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);

      if (newCompleted % settings.sessionsBeforeLong === 0) {
        const nextMode = "longBreak";
        const duration = getModeDuration(nextMode, settings);
        setMode(nextMode);
        setTimeRemaining(duration);
        setTotalTime(duration);
        toast({ title: "🎉 Long break!", description: "Great work! Take a longer rest." });
      } else {
        const nextMode = "shortBreak";
        const duration = getModeDuration(nextMode, settings);
        setMode(nextMode);
        setTimeRemaining(duration);
        setTotalTime(duration);
        toast({ title: "☕ Short break", description: "Stretch, breathe, relax." });
      }
    } else {
      const duration = getModeDuration("focus", settings);
      setMode("focus");
      setTimeRemaining(duration);
      setTotalTime(duration);
      toast({ title: "🎯 Focus time", description: "Let's get back to work!" });
    }
  }, [mode, completedSessions, settings]);

  const updateSettings = useCallback((newSettings: SettingsData) => {
    setSettings(newSettings);
    if (!isRunning) {
      const duration = getModeDuration(mode, newSettings);
      setTimeRemaining(duration);
      setTotalTime(duration);
    }
  }, [isRunning, mode]);

  const start = () => setIsRunning(true);
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

function calculateWorkMinutes(settings: SettingsData): number {
  const [sh, sm] = settings.workStart.split(":").map(Number);
  const [eh, em] = settings.workEnd.split(":").map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  return totalMin - settings.lunchDuration;
}
