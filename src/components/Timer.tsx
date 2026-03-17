import { useEffect, useCallback } from "react";
import TimerRing from "./TimerRing";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerProps {
  mode: TimerMode;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  completedSessions: number;
  sessionsBeforeLong: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const modeLabels: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const modeColors: Record<TimerMode, string> = {
  focus: "hsl(155, 15%, 42%)",
  shortBreak: "hsl(205, 25%, 72%)",
  longBreak: "hsl(8, 40%, 88%)",
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Timer = ({
  mode,
  timeRemaining,
  totalTime,
  isRunning,
  completedSessions,
  sessionsBeforeLong,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerProps) => {
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const color = modeColors[mode];

  // Session dots
  const dots = Array.from({ length: sessionsBeforeLong }, (_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
        i < completedSessions % sessionsBeforeLong
          ? "bg-primary"
          : "bg-border"
      }`}
    />
  ));

  return (
    <div className="flex flex-col items-center gap-6">
      <TimerRing progress={progress} color={color}>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {modeLabels[mode]}
        </span>
        <span className="text-5xl font-light text-foreground tabular-nums tracking-wider">
          {formatTime(timeRemaining)}
        </span>
      </TimerRing>

      {/* Session dots */}
      <div className="flex gap-2">{dots}</div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="rounded-full w-10 h-10 border-border"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={isRunning ? onPause : onStart}
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
          size="icon"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onSkip}
          className="rounded-full w-10 h-10 border-border"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Timer;
