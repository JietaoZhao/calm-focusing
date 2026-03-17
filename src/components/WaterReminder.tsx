import { Droplets } from "lucide-react";

interface WaterReminderProps {
  total: number;
  completed: number;
  onDrink: () => void;
}

const WaterReminder = ({ total, completed, onDrink }: WaterReminderProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-secondary">
        <Droplets className="w-4 h-4" />
        <span className="text-xs tracking-wide">
          {completed} / {total} glasses
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={i === completed ? onDrink : undefined}
            className={`w-3 h-5 rounded-sm border transition-all duration-300 ${
              i < completed
                ? "bg-secondary border-secondary"
                : i === completed
                ? "border-secondary/50 hover:bg-secondary/20 cursor-pointer"
                : "border-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WaterReminder;
