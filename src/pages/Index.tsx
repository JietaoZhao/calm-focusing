import Timer from "@/components/Timer";
import Settings from "@/components/Settings";
import WaterReminder from "@/components/WaterReminder";
import CoffeeTreat from "@/components/CoffeeTreat";
import SuggestionForm from "@/components/SuggestionForm";
import { useTimerEngine } from "@/hooks/useTimerEngine";

const Index = () => {
  const engine = useTimerEngine();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-12 px-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-light tracking-[0.15em] text-foreground">
          Calm
        </h1>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-2">
          Focus · Breathe · Hydrate
        </p>
      </header>

      {/* Main Timer */}
      <main className="flex flex-col items-center gap-8 flex-1 justify-center">
        <Timer
          mode={engine.mode}
          timeRemaining={engine.timeRemaining}
          totalTime={engine.totalTime}
          isRunning={engine.isRunning}
          completedSessions={engine.completedSessions}
          sessionsBeforeLong={engine.settings.sessionsBeforeLong}
          pauseCount={engine.pauseCount}
          pauseReasons={engine.pauseReasons}
          onStart={engine.start}
          onPause={engine.pause}
          onReset={engine.reset}
          onSkip={engine.skip}
          onPauseWithReason={engine.pauseWithReason}
        />

        {/* Water Reminder */}
        {engine.settings.waterEnabled && (
          <WaterReminder
            total={engine.settings.waterGlasses}
            completed={engine.waterDrank}
            onDrink={engine.drinkWater}
          />
        )}

        {/* Settings */}
        <Settings
          settings={engine.settings}
          onChange={engine.updateSettings}
        />
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3 pt-8">
        <CoffeeTreat />
        <p className="text-[10px] text-muted-foreground tracking-wider">
          Built with intention
        </p>
      </footer>
    </div>
  );
};

export default Index;
