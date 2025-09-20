import { useState, useMemo } from "react";
import { addDays, addWeeks, parse, format } from "date-fns";
import { Sun, Loader2 } from "lucide-react";
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
  destinationDetails: Destination | null; // new prop for destination details
  onDateSelect: (date: string) => void;
}

function parseDateRange(dateRange: string, year: number): DateRange | undefined {
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

export function WeatherSuggestion({
  destination,
  destinationDetails,
  onDateSelect,
}: WeatherSuggestionProps) {
  // 🔹 Get AI-based weather suggestions
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ["weather", destination],
    queryFn: () => getWeatherSuggestions(destination, 14),
    enabled: !!destination,
  });

  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // 🔹 Fetch dynamic forecast only when calendar is opened
  const {
    data: forecast,
    isLoading: forecastLoading,
  } = useQuery({
    queryKey: ["forecast", destinationDetails.lat, destinationDetails.lon],
    queryFn: () => getWeatherForecast(destinationDetails.lat, destinationDetails.lon, 10),
    enabled: showCalendar && !!destinationDetails.lat && !!destinationDetails.lon,
  });

  // 🔹 Normalize forecast into WeatherCalendar format
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

  const handleDateSelect = (date: Date) => {
    // optional single-date handling
  };

  const handleRangeSelect = (startDate: Date, endDate: Date | null) => {
    console.log("Range selected:", startDate, endDate);
  };

  // 🔹 Sample events (keep your mock data for now)
  const sampleEvents = [
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(),
      time: "9:00 AM - 10:00 AM",
      type: "work" as const,
      description: "Weekly team sync to discuss project progress and upcoming deliverables.",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Mike Johnson"],
    },
    {
      id: "2",
      title: "Dentist Appointment",
      date: addDays(new Date(), 2),
      time: "2:00 PM - 3:00 PM",
      type: "personal" as const,
      description: "Regular dental checkup and cleaning.",
      location: "Downtown Dental Clinic",
    },
    {
      id: "3",
      title: "Project Deadline",
      date: addDays(new Date(), 5),
      type: "important" as const,
      description: "Final submission for the Q4 product launch.",
      location: "Office",
    },
    {
      id: "4",
      title: "Coffee with Sarah",
      date: addWeeks(new Date(), 1),
      time: "11:00 AM - 12:00 PM",
      type: "personal" as const,
      description: "Catch up over coffee and discuss weekend plans.",
      location: "Central Café",
    },
    {
      id: "5",
      title: "Board Meeting",
      date: addWeeks(new Date(), 1),
      time: "3:00 PM - 5:00 PM",
      type: "work" as const,
      description: "Quarterly board meeting to review performance and strategy.",
      location: "Boardroom",
      attendees: ["CEO", "CTO", "CFO", "Board Members"],
    },
  ];

  // 🔹 AI recommendation cards
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
          {weatherDays.map((day, index) => {
            const isSelected =
              date && format(date.from!, "MMM d") === day.dateRange.split(" - ")[0];

            return (
              <Card
                key={index}
                className={`p-4 hover-elevate cursor-pointer ${
                  isSelected ? "border-2 border-blue-500" : ""
                }`}
                onClick={() => {
                  onDateSelect(day.dateRange);
                  const parsed = parseDateRange(day.dateRange, new Date().getFullYear());
                  if (parsed) {
                    setDate(parsed);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{day.dateRange}</h4>
                    <p className="text-sm text-muted-foreground">{day.condition}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{day.temperature}°C</div>
                    <Badge>{day.score}% Perfect</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowCalendar(true)}
      >
        I'll choose my own dates
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

            <h4 className="mb-4 text-lg font-semibold">Select your travel dates</h4>

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
                onRangeSelect={handleRangeSelect}
                events={sampleEvents}
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
                    const dateRangeString = `${format(
                      date.from,
                      "LLL dd, y"
                    )} - ${format(date.to, "LLL dd, y")}`;
                    onDateSelect(dateRangeString);
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
