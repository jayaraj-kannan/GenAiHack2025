import { useState, useMemo } from "react";
import { addDays, addWeeks, parse, format } from "date-fns";
import { Sun, Cloud, CloudRain, Loader2 } from "lucide-react"; // 🌤 import icons
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWeatherSuggestions, getWeatherForecast } from "@/lib/api";
import { DateRange } from "react-day-picker";
import WeatherCalendar from "./WeatherCalendar";
import { Destination } from "@/lib/types";

interface WeatherDay {
  dateRange: string;
  condition: string;
  temperature: number;
  score: number;
  description: string;
}

interface WeatherSuggestionProps {
  destination: string;
  destinationDetails: Destination | null;
  onDateSelect: (date: string) => void;
}

function parseDateRange(
  dateRange: string,
  year: number
): DateRange | undefined {
  const parts = dateRange.split(" - ");
  if (parts.length !== 2) return undefined;
  try {
    const from = parse(parts[0], "MMM d", new Date(year, 0, 1));
    const to = parse(parts[1], "MMM d", new Date(year, 0, 1));
    return { from, to };
  } catch {
    return undefined;
  }
}

// 🔹 helper: choose icon based on condition
function getWeatherIcon(condition: string) {
  const normalized = condition.toLowerCase();
  if (normalized.includes("rain"))
    return <CloudRain className="h-5 w-5 text-blue-500" />;
  if (normalized.includes("cloud"))
    return <Cloud className="h-5 w-5 text-gray-400" />;
  return <Sun className="h-5 w-5 text-yellow-500" />;
}

export function WeatherSuggestion({
  destination,
  destinationDetails,
  onDateSelect,
}: WeatherSuggestionProps) {
  const {
    data: weatherData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weather", destination],
    queryFn: () => getWeatherSuggestions(destination, 14),
    enabled: !!destination,
  });
  const [customSelected, setCustomSelected] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [selectedDays, setSelectedDays] = useState<{ date: Date; condition: string; temperature: number }[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<{
  range: string;
  condition: string;
  temperature: number | null;
} | null>(null);
  const handleRangeSelect = (startDate: Date, endDate: Date | null) => {
  if (startDate && endDate) {
    setDate({ from: startDate, to: endDate });
    const range = `${format(startDate, "LLL dd, y")} - ${format(
      endDate,
      "LLL dd, y"
    )}`;
    const days = calendarWeather.filter(
      (w) => w.date >= startDate && w.date <= endDate
    );
    const avgTemp =
      days.length > 0
        ? Math.round(days.reduce((a, b) => a + b.temperature, 0) / days.length)
        : null;
    onDateSelect(range);
    setSelectedSummary({
      range,
      condition: days.length > 0 ? days[0].condition : "N/A",
      temperature: avgTemp,
    });
    setSelectedDays(days);
    setCustomSelected(true);
  }
};

  const handleDateSelect = (date: Date) => {
  setDate({ from: date, to: date });
  const range = format(date, "LLL dd, y");
  const dayWeather = calendarWeather.find(
    (w) => w.date.toDateString() === date.toDateString()
  );
  const days = dayWeather ? [dayWeather] : [];
  const avgTemp = dayWeather ? dayWeather.temperature : null;

  onDateSelect(range);
  setSelectedSummary({
      range,
      condition: days.length > 0 ? days[0].condition : "N/A",
      temperature: avgTemp,
    });
  setSelectedDays(days);
  setCustomSelected(true);
};
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ["forecast", destinationDetails?.lat, destinationDetails?.lon],
    queryFn: () =>
      getWeatherForecast(destinationDetails!.lat, destinationDetails!.lon, 10),
    enabled:
      showCalendar && !!destinationDetails?.lat && !!destinationDetails?.lon,
  });

  const calendarWeather = useMemo(() => {
    if (!forecast) return [];
    return forecast.forecastDays.map((day: any) => {
      const conditionText = day.condition.toLowerCase();
      let condition: "sunny" | "cloudy" | "rainy" = "sunny";
      if (conditionText.includes("cloud")) condition = "cloudy";
      if (conditionText.includes("rain")) condition = "rainy";

      return {
        date: new Date(day.date),
        condition,
        temperature: day.maxTemp ?? 0,
      };
    });
  }, [forecast]);

  const weatherDays: WeatherDay[] =
    (weatherData?.recommendations || []).map((rec: any) => ({
      dateRange: rec.dateRange,
      condition: rec.condition,
      temperature: rec.temperature,
      score: rec.score,
      description: rec.description,
    })) || [];

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
          <p className="text-sm text-muted-foreground">
            Loading weather recommendations...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Unable to load weather data. Using default suggestions.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {/* 🔹 Show summary card if selection exists */}
          {selectedSummary && (
            <Card className="p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(selectedSummary.condition)}
                  <div>
                    <h4 className="font-medium">{selectedSummary.range}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSummary.condition}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {selectedSummary.temperature}°C
                  </div>
                  <Badge className="bg-green-500 text-white">Selected Days</Badge>
                </div>
              </div>
            </Card>
          )}

          {/* 🔹 Best Days to Travel stays visible */}
          {weatherDays.map((day, index) => {
            const isSelected =
              date &&
              format(date.from!, "MMM d") === day.dateRange.split(" - ")[0];

            return (
              <Card
                key={index}
                className={`p-4 hover-elevate cursor-pointer ${
                  isSelected ? "border-2 border-blue-500" : ""
                }`}
                onClick={() => {
                  const parsed = parseDateRange(
                    day.dateRange,
                    new Date().getFullYear()
                  );
                  if (parsed) {
                    setDate(parsed);
                    onDateSelect(day.dateRange);
                    setSelectedDays([
                      {
                        date: parsed.from!,
                        condition: day.condition,
                        temperature: day.temperature,
                      },
                    ]);
                    setCustomSelected(true);
                    setSelectedSummary({
                      range: day.dateRange,
                      condition: day.condition,
                      temperature: day.temperature,
                    });
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(day.condition)}
                    <div>
                      <h4 className="font-medium">{day.dateRange}</h4>
                      <p className="text-sm text-muted-foreground">
                        {day.condition}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {day.temperature}°C
                    </div>
                    <Badge>{day.score}% Perfect</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* calendar modal stays the same... */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowCalendar(true)}
      >
        {customSelected
          ? "I'll choose different dates"
          : "I'll choose my own dates"}
      </Button>

      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-background rounded-lg shadow-lg p-6 w-full max-w-4xl relative max-h-screen overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCalendar(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h4 className="mb-4 text-lg font-semibold">
              Select your travel dates
            </h4>

            {forecastLoading ? (
              <div className="text-center py-6">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading forecast data...
                </p>
              </div>
            ) : (
              <WeatherCalendar
                onDateSelect={handleDateSelect}
                onRangeSelect={handleRangeSelect} // ✅ pass updated handler
                events={[]}
                weather={calendarWeather}
                className="w-full"
                selectedRange={date}
              />
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCalendar(false)}>
                Cancel
              </Button>
              <Button
                disabled={!date?.from || !date?.to}
                onClick={() => {
                  if (date?.from && date?.to) {
                    const range = `${format(date.from, "LLL dd, y")} - ${format(
                      date.to,
                      "LLL dd, y"
                    )}`;

                    const days = calendarWeather.filter(
                      (w) => w.date >= date.from! && w.date <= date.to!
                    );

                    const avgTemp =
                      days.length > 0
                        ? Math.round(
                            days.reduce((a, b) => a + b.temperature, 0) /
                              days.length
                          )
                        : null;

                    onDateSelect(range);
                    setSelectedDays(days);
                    setSelectedSummary({
                      range,
                      condition: days.length > 0 ? days[0].condition : "N/A",
                      temperature: avgTemp,
                    });
                    setCustomSelected(true);
                    setShowCalendar(false);
                  }
                }}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
