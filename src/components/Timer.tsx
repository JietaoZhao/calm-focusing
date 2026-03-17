import { useState } from "react";
import TimerRing from "./TimerRing";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerProps {
  mode: TimerMode;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  completedSessions: number;
  sessionsBeforeLong: number;
  pauseCount: number;
  pauseReasons: string[];
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onPauseWithReason: (reason: string) => void;
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

const INTERRUPTION_OPTIONS = [
  { label: "Restroom Break", reason: "", isRestroom: true },
  { label: "Virtual Meeting", reason: "Paused for virtual meeting" },
  { label: "In-Person Meeting", reason: "Paused for in-person meeting" },
  { label: "Other Interruption", reason: "Paused for other interruption" },
];

const SHORT_BREAK_SUGGESTIONS = [
  {
    label: "Visual & Eye Relaxation",
    tips: [
      "Look out the window (focus on something far away)",
      "Watch greenery (trees, plants, grass)",
      "Sky gazing (clouds, horizon)",
    ],
  },
  {
    label: "Body Reset",
    tips: [
      "Neck rolls / shoulder rolls",
      "Stand up + stretch arms overhead",
      "10–15 squats or pushups",
      "Walk around your room/office",
    ],
  },
  {
    label: "Breathing Control",
    tips: [
      "Breath in for 5 seconds",
      "Hold it for 5 seconds",
      "Exhale for 5 seconds",
      "Cycle 3–5 times",
      "Reduce stress and lower emotional tension",
    ],
  },
];

const Timer = ({
  mode,
  timeRemaining,
  totalTime,
  isRunning,
  completedSessions,
  sessionsBeforeLong,
  pauseCount,
  pauseReasons,
  onStart,
  onPause,
  onReset,
  onSkip,
  onPauseWithReason,
}: TimerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const color = modeColors[mode];

  const handlePauseClick = () => {
    if (mode === "focus" && pauseCount >= 2) {
      setShowDialog(true);
    } else {
      onPause();
    }
  };

  const handleInterruption = (option: typeof INTERRUPTION_OPTIONS[number]) => {
    setShowDialog(false);
    if (option.isRestroom) {
      // Timer keeps running — no pause
      return;
    }
    onPauseWithReason(option.reason);
  };

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

        {/* Short break suggestions */}
        {mode === "shortBreak" && (
          <div className="mt-2 flex flex-col gap-1 max-w-[180px]">
            {SHORT_BREAK_SUGGESTIONS.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <ul className="text-xs space-y-1">
                      {item.tips.map((tip, i) => (
                        <li key={i}>· {tip}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
        {pauseReasons.length > 0 && (
          <div className="mt-2 text-center max-w-[160px]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
              Focusing Helper
            </span>
            {pauseReasons.map((reason, i) => (
              <p key={i} className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                · {reason}
              </p>
            ))}
          </div>
        )}
      </TimerRing>

      {/* Pause count indicator */}
      {mode === "focus" && pauseCount > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Paused {pauseCount} time{pauseCount !== 1 ? "s" : ""}
        </p>
      )}

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
          onClick={isRunning ? handlePauseClick : onStart}
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

      {/* Interruption Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Focusing Helper</DialogTitle>
            <DialogDescription className="text-sm">
              What difficulties did you encounter?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {INTERRUPTION_OPTIONS.map((option) => (
              <Button
                key={option.label}
                variant={option.isRestroom ? "ghost" : "outline"}
                className="w-full justify-start text-sm"
                onClick={() => handleInterruption(option)}
              >
                {option.label}
                {option.isRestroom && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    No pause needed
                  </span>
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default Timer;
