import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface DestinationSearchProps {
  onDestinationSelect: (destination: string) => void;
}

export function DestinationSearch({ onDestinationSelect }: DestinationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock destinations for autocomplete
  const mockDestinations = [
    "Paris, France",
    "Tokyo, Japan", 
    "New York, USA",
    "Bali, Indonesia",
    "London, England",
    "Rome, Italy",
    "Barcelona, Spain",
    "Thailand",
    "Kerala, India",
    "Goa, India"
  ];

  const filteredDestinations = mockDestinations.filter(dest =>
    dest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationClick = (destination: string) => {
    setSearchQuery(destination);
    setShowSuggestions(false);
    onDestinationSelect(destination);
    console.log("Destination selected:", destination);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Where do you want to go?"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          className="pl-10 pr-4"
          data-testid="input-destination-search"
        />
      </div>

      {showSuggestions && filteredDestinations.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 p-2 max-h-64 overflow-y-auto">
          {filteredDestinations.map((destination, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-2 h-auto"
              onClick={() => handleDestinationClick(destination)}
              data-testid={`button-destination-${index}`}
            >
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              {destination}
            </Button>
          ))}
        </Card>
      )}
    </div>
  );
}