import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sparkles, Zap, Globe, User, Users } from "lucide-react";
import { DestinationSearch } from "./DestinationSearch";
import heroImage from "@assets/generated_images/Travel_destination_hero_image_34af79f1.png";

// --- Add this import for your modal (adjust path as needed) ---
import { MapModal } from "./MapModal";
import { Destination } from "@/lib/types";

interface HeroSectionProps {
  onGetStarted: (destination: string, destinationDetails: Destination) => void;
  tripType: "solo" | "group";
  setTripType: (val: "solo" | "group") => void;
  groupCount: number;
  setGroupCount: (val: number) => void;
}

export function HeroSection({
  onGetStarted,
  tripType,
  setTripType,
  groupCount,
  setGroupCount,
}: HeroSectionProps) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Beautiful travel destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 text-white">
        <div className="space-y-6">
          {/* AI Badge */}
          <div className="flex justify-center">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Plan Your Perfect Trip with
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                AI Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Create personalized itineraries based on your mood, budget, and
              real-time conditions. Book everything with one click.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <Zap className="h-4 w-4 text-yellow-400" />
              Mood-Based Planning
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <Globe className="h-4 w-4 text-blue-400" />
              Real-Time Optimization
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-purple-400" />
              One-Click Booking
            </div>
          </div>

          {/* Trip Type Toggle + Group Input */}
          <div className="flex justify-center gap-4">
            <ToggleGroup
              type="single"
              value={tripType}
              onValueChange={(val: "solo" | "group") => val && setTripType(val)}
              className="flex gap-4"
            >
              <ToggleGroupItem
                value="solo"
                aria-label="Solo Trip"
                className="data-[state=on]:bg-blue-500 data-[state=on]:text-white rounded-full px-4 py-2"
              >
                <User className="h-4 w-4 mr-2" />
                Solo
              </ToggleGroupItem>

              {/* Group Button + Input Inline */}
              <div className="flex items-center gap-2">
                <ToggleGroupItem
                  value="group"
                  aria-label="Group Trip"
                  className="data-[state=on]:bg-blue-500 data-[state=on]:text-white rounded-full px-4 py-2"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Group
                </ToggleGroupItem>

                {tripType === "group" && (
                  <Input
                    type="number"
                    min={2}
                    max={20}
                    value={groupCount}
                    onChange={(e) => setGroupCount(Number(e.target.value))}
                    className="
    w-20 text-center rounded-lg border 
    bg-white text-black 
    dark:bg-gray-800 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500
  "
                    placeholder="Count"
                  />
                )}
              </div>
            </ToggleGroup>
          </div>

          {/* Search */}
          <div className="space-y-4">
            <DestinationSearch onDestinationSelect={onGetStarted} />
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => setMapOpen(true)}
              data-testid="button-view-map"
            >
              View Map
            </Button>
            <p className="text-sm text-gray-300">
              Start planning your dream trip in seconds
            </p>
          </div>
        </div>
      </div>

      <MapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onPlaceSelect={(place) => onGetStarted(place.name, place)}
      />
    </div>
  );
}
