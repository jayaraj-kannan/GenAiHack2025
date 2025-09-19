import { useEffect, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { MoodSelector } from "@/components/MoodSelector";
import { TripDurationPicker } from "@/components/TripDurationPicker";
import { WeatherSuggestion } from "@/components/WeatherSuggestion";
import { BudgetEstimator } from "@/components/BudgetEstimator";
import { TravelMode } from "@/components/TravelMode";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationSearch } from "@/components/DestinationSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Profile } from "@/components/Profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Users, Download, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createTrip,
  estimateBudget,
  generateItinerary,
  getTrip,
  getTripItineraries,
  type Trip,
  type Itinerary,
  type EstimateBudgetRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import hampi_heritage from "@assets/generated_images/hampi_heritage.png";
import tamilnadu from "@assets/generated_images/tamilnadu.png";
import kerala_backwaters from "@assets/generated_images/kerala_backwaters.png";
import coorg_adventure from "@assets/generated_images/coorg_adventure.png";
import pondicherry from "@assets/generated_images/pondicherry.png";
import andaman_beach from "@assets/generated_images/andaman_beach.png";

type PlanningStep = "hero" | "preferences" | "suggestions" | "itinerary";

// ✅ Types for budget
export interface BudgetOption {
  total?: number;   // present in budget, moderate, luxury
  min?: number;     // present in custom
  max?: number;     // present in custom
  breakdown: Record<string, number>;
  notes: string[];
}

export interface BudgetEstimation {
  budget: BudgetOption;
  moderate: BudgetOption;
  luxury: BudgetOption;
  custom: BudgetOption;
}

export interface EstimateBudgetResponse {
  budgetEstimation: BudgetEstimation;
  aiGenerated: boolean;
}



export default function Home() {
  const [currentStep, setCurrentStep] = useState<PlanningStep>("hero");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTravelMode, setSelectedTravelMode] = useState<string>("");
  const [tripDuration, setTripDuration] = useState(7);
  const [selectedDates, setSelectedDates] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState(0);

  const [budgetData, setBudgetData] = useState<any | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [tripType, setTripType] = useState<"solo" | "group">("solo");
  const [groupCount, setGroupCount] = useState(2);

  const { toast } = useToast();

  // React Query hooks for API calls
  const { data: currentTrip } = useQuery({
    queryKey: ["trip", currentTripId],
    queryFn: () => getTrip(currentTripId!),
    enabled: !!currentTripId,
  });

  const { data: queryItineraries } = useQuery({
    queryKey: ["itineraries", currentTripId],
    queryFn: () => getTripItineraries(currentTripId!),
    enabled: !!currentTripId,
  });
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  useEffect(() => {
    if (queryItineraries) {
      setItineraries(queryItineraries);
    }
  }, [queryItineraries]);

  const createTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (trip) => {
      setCurrentTripId(trip.id);
      toast({
        title: "Trip Created!",
        description: `Your ${trip.destination} trip has been created.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateItineraryMutation = useMutation({
    mutationFn: generateItinerary,
    onSuccess: async () => {
      setItineraries(await getTripItineraries(currentTripId!));
      setCurrentStep("itinerary");
      toast({
        title: "Itinerary Generated!",
        description: "Your personalized AI itinerary is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ✅ Fetch budget once when preferences are ready
 useEffect(() => {
  if (
    selectedDestination &&
    selectedMoods.length > 0 &&
    selectedTravelMode &&
    tripType
  ) {
    setLoadingBudget(true);
    (async () => {
      try {
        const res = await estimateBudget({
          destination: selectedDestination,
          moods: selectedMoods,
          duration: tripDuration,
          tripType,
          travelMode: selectedTravelMode as EstimateBudgetRequest["travelMode"],
        });

        setBudgetData(res.budgetEstimation ? res.budgetEstimation : null); // ✅ strongly typed
      } catch (err) {
        console.error("Failed to fetch budget:", err);
        setBudgetData(null);
      } finally {
        setLoadingBudget(false);
      }
    })();
  }
}, [
  selectedDestination,
  selectedMoods,
  tripDuration,
  selectedTravelMode,
  tripType,
]);


  const featuredDestinations = [
    {
      id: "tn_culture",
      name: "Tamil Nadu Temples",
      image: tamilnadu,
      description:
        "Marvel at the Dravidian architecture of Meenakshi Temple, Brihadeeswarar Temple, and the Shore Temple at Mahabalipuram.",
      rating: 4.8,
      duration: "5-7 days",
      price: 65000,
      mood: "Culture",
    },
    {
      id: "kerala_backwaters",
      name: "Kerala Backwaters",
      image: kerala_backwaters,
      description:
        "Cruise through Alleppey and Kumarakom on a traditional houseboat, enjoy Ayurvedic massages and serene sunsets.",
      rating: 4.7,
      duration: "4-6 days",
      price: 72000,
      mood: "Relax",
    },
    {
      id: "coorg_adventure",
      name: "Coorg & Wayanad Adventure",
      image: coorg_adventure,
      description:
        "Trek the lush coffee hills, experience waterfalls, wildlife safaris, and the thrill of river rafting in Karnataka & Kerala.",
      rating: 4.9,
      duration: "6-8 days",
      price: 78000,
      mood: "Adventure",
    },
    {
      id: "pondy_romantic",
      name: "Pondicherry – French Riviera of the East",
      image: pondicherry,
      description:
        "Walk along French-style boulevards, relax on quiet beaches, and enjoy a mix of Indian and French cuisine.",
      rating: 4.6,
      duration: "3-5 days",
      price: 55000,
      mood: "Romantic",
    },
    {
      id: "andaman_beach",
      name: "Andaman Islands",
      image: andaman_beach,
      description:
        "Pristine white sand beaches, scuba diving, snorkeling, and breathtaking sunsets at Radhanagar Beach.",
      rating: 4.9,
      duration: "5-7 days",
      price: 95000,
      mood: "Beach & Coastal",
    },
    {
      id: "hampi_heritage",
      name: "Hampi – UNESCO Heritage",
      image: hampi_heritage,
      description:
        "Explore the ruins of the Vijayanagara Empire, ancient temples, and boulder-strewn landscapes.",
      rating: 4.7,
      duration: "4-6 days",
      price: 60000,
      mood: "Heritage",
    },
  ];

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentStep("preferences");
    console.log("Starting planning for:", destination);
  };

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((id) => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleGenerateItinerary = async () => {
    try {
      const tripData = {
        destination: selectedDestination,
        duration: tripDuration,
        moods: selectedMoods,
        travelMode: selectedTravelMode,
        budget: estimatedBudget > 0 ? estimatedBudget.toString() : undefined,
        startDate: selectedDates || undefined,
        status: "planning",
      };

      const trip = await createTripMutation.mutateAsync(tripData);
      await generateItineraryMutation.mutateAsync(trip.id);
    } catch (error) {
      console.error("Error in trip planning flow:", error);
    }
  };

  const handleBookNow = () => {
    if (currentTrip) {
      toast({
        title: "🎉 Booking Initiated!",
        description: `Your ${currentTrip.destination} trip is ready for booking. Payment integration coming soon!`,
      });
    }
  };

  const handleBackToSearch = () => {
    setCurrentStep("hero");
    setSelectedDestination("");
    setSelectedMoods([]);
    setTripDuration(7);
    setSelectedDates("");
    setEstimatedBudget(0);
    setCurrentTripId(null);
    setBudgetData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TripCraft</span>
            <Badge variant="secondary" className="text-xs">
              AI-Powered
            </Badge>
          </div>

          <div className="flex items-right gap-4">
            {currentStep !== "hero" && (
              <Button variant="ghost" onClick={handleBackToSearch}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            )}
            <ThemeToggle />
             <Profile />
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentStep === "hero" && (
          <div className="space-y-12">
            <HeroSection
              onGetStarted={handleDestinationSelect}
              tripType={tripType}
              setTripType={setTripType}
              groupCount={groupCount}
              setGroupCount={setGroupCount}
            />
            {/* Featured Destinations */}
            <section className="w-full container px-6 py-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Popular Experiences</h2>
                <p className="text-muted-foreground">
                  Curated trips based on different travel moods
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {featuredDestinations.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    {...dest}
                    onClick={() => handleDestinationSelect(dest.name)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {currentStep === "preferences" && (
          <div className="container px-6 py-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">
                  Customize Your {selectedDestination}{" "}
                  {tripType === "solo" ? "Solo Trip" : "Group Trip"}
                </h1>
                <p className="text-muted-foreground">
                  Tell us your preferences for a personalized experience
                </p>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <MoodSelector
                      selectedMoods={selectedMoods}
                      onMoodToggle={handleMoodToggle}
                    />
                  </Card>

                  <Card className="p-6">
                    <TripDurationPicker
                      duration={tripDuration}
                      onDurationChange={setTripDuration}
                    />
                  </Card>
                </div>

                <Card className="p-6">
                  <TravelMode onModeChange={setSelectedTravelMode} />
                </Card>

                <Card className="p-6">
                  {loadingBudget ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>Calculating budget...</span>
                    </div>
                  ) : (
                    <BudgetEstimator
                      data={budgetData}
                      onSelect={setEstimatedBudget}
                    />
                  )}
                </Card>

                <Card className="p-6">
                  <WeatherSuggestion
                    destination={selectedDestination}
                    onDateSelect={setSelectedDates}
                  />
                </Card>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleGenerateItinerary}
                  disabled={
                    selectedMoods.length === 0 ||
                    createTripMutation.isPending ||
                    generateItineraryMutation.isPending
                  }
                  className="px-8 py-3 text-lg"
                >
                  {createTripMutation.isPending ||
                  generateItineraryMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating AI Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate AI Itinerary
                    </>
                  )}
                </Button>
                {selectedMoods.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select at least one travel mood to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === "itinerary" && currentTrip && (
          <div className="container px-6 py-12 max-w-6xl mx-auto">
            {itineraries.length > 0 ? (
              <ItineraryDisplay
                destination={currentTrip.destination}
                days={itineraries.map((itinerary) => ({
                  day: itinerary.day,
                  date: itinerary.date,
                  activities: itinerary.activities,
                  totalCost: parseFloat(itinerary.totalCost),
                }))}
                totalBudget={parseFloat(currentTrip.budget || "0")}
                onBookNow={handleBookNow}
                onModifyItinerary={() => setCurrentStep("preferences")}
              />
            ) : (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">
                  Loading your personalized itinerary...
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
