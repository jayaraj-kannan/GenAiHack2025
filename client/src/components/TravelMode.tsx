import { useState, useEffect } from "react";
import { Car, Bus, Train, Plane, Bike ,CarTaxiFront} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TravelModeSelectorProps {
  onModeChange?: (mode: string) => void; // optional now
}

export function TravelMode({ onModeChange = () => {} }: TravelModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<string>("ownCar");

  const travelModes = {
    ownCar: {
      label: "Own Car",
      icon: Car,
      description: "Drive your own vehicle, flexible and comfortable",
    },
    publicBus: {
      label: "Public Bus",
      icon: Bus,
      description: "Affordable bus travel across destinations",
    },
    train: {
      label: "Train",
      icon: Train,
      description: "Comfortable and scenic train journeys",
    },
    flight: {
      label: "Flight",
      icon: Plane,
      description: "Fastest travel option for long distances",
    },
    ownBike: {
      label: "Own Bike",
      icon: Bike,
      description: "Adventure road trip on your bike",
    },
    cab: {
      label: "Cab",
      icon: CarTaxiFront,
      description: "Convenient and comfortable cab rides",
    },
  };

  const handleSelect = (mode: string) => {
    setSelectedMode(mode);
    onModeChange(mode);
  };

  useEffect(() => {
    // fire default selection once on mount
    onModeChange(selectedMode);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Select Your Travel Mode</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Choose how you’d like to travel. Costs and experience vary depending on mode.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(travelModes).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Card
              key={key}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedMode === key ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => handleSelect(key)}
              data-testid={`travel-mode-${key}`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon className="h-6 w-6 text-muted-foreground" />
                <h4 className="font-medium">{config.label}</h4>
                <p className="text-xs text-muted-foreground">{config.description}</p>
                {selectedMode === key && (
                  <Badge variant="default" className="mt-2 text-xs">
                    Selected
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
