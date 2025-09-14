import { Cloud, Sun, CloudRain, Wind, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWeatherSuggestions } from "@/lib/api";

interface WeatherDay {
  dateRange: string;
  condition: string;
  temperature: number;
  icon: React.ReactNode;
  score: number;
  description: string;
}

interface WeatherSuggestionProps {
  destination: string;
  onDateSelect: (date: string) => void;
}

export function WeatherSuggestion({ destination, onDateSelect }: WeatherSuggestionProps) {
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ["weather", destination],
    queryFn: () => getWeatherSuggestions(destination, 7),
    enabled: !!destination,
  });

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return <Sun className="h-4 w-4" />;
    }
    if (conditionLower.includes("cloud")) {
      return <Cloud className="h-4 w-4" />;
    }
    if (conditionLower.includes("rain")) {
      return <CloudRain className="h-4 w-4" />;
    }
    if (conditionLower.includes("snow")) {
      return <Wind className="h-4 w-4" />;
    }
    return <Wind className="h-4 w-4" />;
  };

  const weatherDays: WeatherDay[] = (weatherData?.recommendations || []).map((rec: any) => ({
    dateRange: rec.dateRange,
    condition: rec.condition,
    temperature: rec.temperature,
    icon: getWeatherIcon(rec.condition),
    score: rec.score,
    description: rec.description
  })) || [];

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

      {isLoading ? (
        <div className="text-center py-6">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading weather recommendations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Unable to load weather data. Using default suggestions.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {weatherDays.map((day, index) => (
            <Card 
              key={index} 
              className="p-4 hover-elevate cursor-pointer"
              onClick={() => {
                onDateSelect(day.dateRange);
                console.log("Selected travel dates:", day.dateRange);
              }}
              data-testid={`weather-option-${index}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                    {day.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{day.dateRange}</h4>
                    <p className="text-sm text-muted-foreground">{day.condition}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold">{day.temperature}°C</div>
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
      )}

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