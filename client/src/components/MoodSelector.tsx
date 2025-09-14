import { Badge } from "@/components/ui/badge";
import { Sparkles, Mountain, Building2, Heart } from "lucide-react";

interface MoodOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface MoodSelectorProps {
  selectedMoods: string[];
  onMoodToggle: (moodId: string) => void;
}

export function MoodSelector({ selectedMoods, onMoodToggle }: MoodSelectorProps) {
  const moodOptions: MoodOption[] = [
    {
      id: "relax",
      label: "Relax & Recharge",
      description: "Spa retreats, slow itineraries, nature walks",
      icon: <Heart className="h-4 w-4" />,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    },
    {
      id: "adventure",
      label: "Adventure Mode",
      description: "Trekking, water sports, hidden trails",
      icon: <Mountain className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    },
    {
      id: "culture",
      label: "Culture Deep Dive",
      description: "Local food, history tours, traditional stays",
      icon: <Building2 className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    },
    {
      id: "discovery",
      label: "Hidden Gems",
      description: "Off-the-beaten-path, local experiences",
      icon: <Sparkles className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What's your travel mood?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moodOptions.map((mood) => {
          const isSelected = selectedMoods.includes(mood.id);
          return (
            <div
              key={mood.id}
              className={`p-4 rounded-md border cursor-pointer transition-all hover-elevate ${
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border"
              }`}
              onClick={() => onMoodToggle(mood.id)}
              data-testid={`mood-option-${mood.id}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${mood.color}`}>
                  {mood.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{mood.label}</h4>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mood.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}