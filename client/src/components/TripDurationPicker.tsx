import { CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TripDurationPickerProps {
  duration: number;
  onDurationChange: (days: number) => void;
}

export function TripDurationPicker({ duration, onDurationChange }: TripDurationPickerProps) {
  const [customDays, setCustomDays] = useState("");

  const presetDurations = [
    { days: 3, label: "Weekend", subtitle: "3 days" },
    { days: 7, label: "One Week", subtitle: "7 days" },
    { days: 14, label: "Two Weeks", subtitle: "14 days" },
    { days: 21, label: "Extended", subtitle: "21 days" }
  ];

  const handleCustomDuration = () => {
    const days = parseInt(customDays);
    if (days > 0 && days <= 365) {
      onDurationChange(days);
      console.log("Custom duration set:", days, "days");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">How long is your trip?</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presetDurations.map((preset) => (
          <Card
            key={preset.days}
            className={`p-4 cursor-pointer transition-all hover-elevate ${
              duration === preset.days 
                ? "border-primary bg-primary/5" 
                : "border-border"
            }`}
            onClick={() => {
              onDurationChange(preset.days);
              console.log("Duration selected:", preset.days, "days");
            }}
            data-testid={`duration-preset-${preset.days}`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h4 className="font-medium">{preset.label}</h4>
              <p className="text-sm text-muted-foreground">{preset.subtitle}</p>
              {duration === preset.days && (
                <Badge variant="default" className="mt-2 text-xs">
                  Selected
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <h4 className="font-medium">Custom Duration</h4>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="365"
              placeholder="Enter days"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
              data-testid="input-custom-duration"
            />
            <Button 
              onClick={handleCustomDuration}
              disabled={!customDays || parseInt(customDays) <= 0}
              data-testid="button-set-custom-duration"
            >
              Set
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}