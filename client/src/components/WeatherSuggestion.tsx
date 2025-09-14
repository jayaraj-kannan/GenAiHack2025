import { Cloud, Sun, CloudRain, CloudSnow, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WeatherDay {
  date: string;
  condition: string;
  temp: number;
  icon: React.ReactNode;
  score: number;
}

interface WeatherSuggestionProps {
  destination: string;
  onDateSelect: (date: string) => void;
}

export function WeatherSuggestion({ destination, onDateSelect }: WeatherSuggestionProps) {
  // Mock weather data - in real app would come from weather API
  const weatherDays: WeatherDay[] = [
    {
      date: "Sep 15-17",
      condition: "Mostly Sunny",
      temp: 24,
      icon: <Sun className="h-4 w-4" />,
      score: 95
    },
    {
      date: "Sep 20-22", 
      condition: "Partly Cloudy",
      temp: 22,
      icon: <Cloud className="h-4 w-4" />,
      score: 85
    },
    {
      date: "Sep 25-27",
      condition: "Light Rain",
      temp: 19,
      icon: <CloudRain className="h-4 w-4" />,
      score: 65
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 75) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sun className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Best Days to Travel</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        AI-optimized weather windows for {destination}
      </p>

      <div className="grid gap-3">
        {weatherDays.map((day, index) => (
          <Card 
            key={index} 
            className="p-4 hover-elevate cursor-pointer"
            onClick={() => {
              onDateSelect(day.date);
              console.log("Selected travel dates:", day.date);
            }}
            data-testid={`weather-option-${index}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                  {day.icon}
                </div>
                <div>
                  <h4 className="font-medium">{day.date}</h4>
                  <p className="text-sm text-muted-foreground">{day.condition}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold">{day.temp}°C</div>
                <Badge 
                  className={`text-xs ${getScoreColor(day.score)}`}
                >
                  {day.score}% Perfect
                </Badge>
              </div>
            </div>
            
            {index === 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <Badge variant="default" className="text-xs">
                  🏆 Recommended by AI
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => console.log("Manual date selection requested")}
        data-testid="button-manual-date-select"
      >
        I'll choose my own dates
      </Button>
    </div>
  );
}