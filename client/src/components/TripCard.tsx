import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Car, Bus, Train, Plane, Bike } from "lucide-react";

interface TripCardProps {
  id: string;
  destination: string;
  description: string;
  budget: number;
  duration: number;
  moods: string[];
  travelMode: string;
  tripType: string;
  onClick: (id: string) => void;
}

export function TripCard({
  id,
  destination,
  description,
  budget,
  duration,
  moods,
  travelMode,
  tripType,
  onClick,
}: TripCardProps) {
  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "culture":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "adventure":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "relax":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "discovery":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTravelModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "ownbike":
        return <Bike className="h-4 w-4" />;
      case "own car":
        return <Car className="h-4 w-4" />;
      case "public bus":
        return <Bus className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      case "flight":
        return <Plane className="h-4 w-4" />;
      case "cab":
        return <Car className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className="overflow-hidden hover-elevate cursor-pointer"
      onClick={() => onClick(id)}
      data-testid={`trip-card-${id}`}
    >
      <div className="relative">
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm font-medium">
          ₹ {budget}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{destination}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Planned trip
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {moods.map((mood) => (
            <Badge key={mood} className={getMoodColor(mood)}>
              {mood}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              {getTravelModeIcon(travelMode)}
              <span>{travelMode}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{tripType}</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick(id);
              console.log("Trip selected:", destination);
            }}
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  );
}
