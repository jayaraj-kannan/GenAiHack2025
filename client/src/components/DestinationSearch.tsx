import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchDestinations } from "@/lib/api";

interface DestinationSearchProps {
  onDestinationSelect: (destination: string) => void;
}

export function DestinationSearch({ onDestinationSelect }: DestinationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Fetch real destination suggestions
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["destinations", debouncedQuery],
    queryFn: () => searchDestinations(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 300000, // Cache results for 5 minutes
  });

  const suggestions = searchResults?.suggestions || [];

  const handleDestinationClick = (suggestion: any) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    onDestinationSelect(suggestion.name);
    console.log("Destination selected:", suggestion.name);
  };

  return (
    <div className="flex justify-center items-center w-full">
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
            autoComplete="off"
          />
          {showSuggestions && (isLoading || suggestions.length > 0) && (
            <Card className="absolute left-0 right-0 z-50 w-full mt-1 p-2 max-h-64 overflow-y-auto bg-background shadow-lg border">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching destinations...</span>
                </div>
              ) : (
                suggestions.map((suggestion: any, index: number) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => handleDestinationClick(suggestion)}
                    data-testid={`button-destination-${index}`}
                  >
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium">{suggestion.name}</div>
                      {suggestion.fullName !== suggestion.name && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.fullName}
                        </div>
                      )}
                    </div>
                  </Button>
                ))
              )}
            </Card>
          )}
        </div>
        </div>
    </div>
  );
}