import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface SettingsData {
  mode: "simple" | "schedule";
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLong: number;
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchDuration: number;
  waterEnabled: boolean;
  waterGlasses: number;
}

interface SettingsProps {
  settings: SettingsData;
  onChange: (settings: SettingsData) => void;
}

const Settings = ({ settings, onChange }: SettingsProps) => {
  const [open, setOpen] = useState(false);

  const update = (partial: Partial<SettingsData>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-md">
      <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-3">
        <SettingsIcon className="w-4 h-4" />
        <span className="text-sm tracking-wide">Settings</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4 pb-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Work Schedule Mode</Label>
            <Switch
              checked={settings.mode === "schedule"}
              onCheckedChange={(checked) => update({ mode: checked ? "schedule" : "simple" })}
            />
          </div>

          {settings.mode === "simple" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Focus: {settings.focusMinutes} min</Label>
                <Slider
                  value={[settings.focusMinutes]}
                  onValueChange={([v]) => update({ focusMinutes: v })}
                  min={10}
                  max={60}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Short Break: {settings.shortBreakMinutes} min</Label>
                <Slider
                  value={[settings.shortBreakMinutes]}
                  onValueChange={([v]) => update({ shortBreakMinutes: v })}
                  min={1}
                  max={15}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Long Break: {settings.longBreakMinutes} min</Label>
                <Slider
                  value={[settings.longBreakMinutes]}
                  onValueChange={([v]) => update({ longBreakMinutes: v })}
                  min={5}
                  max={30}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Sessions before long break: {settings.sessionsBeforeLong}</Label>
                <Slider
                  value={[settings.sessionsBeforeLong]}
                  onValueChange={([v]) => update({ sessionsBeforeLong: v })}
                  min={2}
                  max={8}
                  step={1}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Work Start</Label>
                  <Input
                    type="time"
                    value={settings.workStart}
                    onChange={(e) => update({ workStart: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Work End</Label>
                  <Input
                    type="time"
                    value={settings.workEnd}
                    onChange={(e) => update({ workEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Lunch Start</Label>
                  <Input
                    type="time"
                    value={settings.lunchStart}
                    onChange={(e) => update({ lunchStart: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Lunch (min)</Label>
                  <Input
                    type="number"
                    value={settings.lunchDuration}
                    onChange={(e) => update({ lunchDuration: parseInt(e.target.value) || 60 })}
                    min={15}
                    max={120}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Water Reminder */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Water Reminder</Label>
              <Switch
                checked={settings.waterEnabled}
                onCheckedChange={(checked) => update({ waterEnabled: checked })}
              />
            </div>
            {settings.waterEnabled && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Glasses per day: {settings.waterGlasses}</Label>
                <Slider
                  value={[settings.waterGlasses]}
                  onValueChange={([v]) => update({ waterGlasses: v })}
                  min={4}
                  max={16}
                  step={1}
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default Settings;
