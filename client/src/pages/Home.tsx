import { useEffect, useRef, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { MoodSelector } from "@/components/MoodSelector";
import { TripDurationPicker } from "@/components/TripDurationPicker";
import { WeatherSuggestion } from "@/components/WeatherSuggestion";
import { BudgetEstimator } from "@/components/BudgetEstimator";
import { TravelMode } from "@/components/TravelMode";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";
import { DestinationCard } from "@/components/DestinationCard";
import { TripCard } from "@/components/TripCard";
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
  updateTripItineraries,
  getUserTrips,
  useAuth,
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
import { Destination } from "@/lib/types";

type PlanningStep = "hero" | "preferences" | "suggestions" | "itinerary";

// ✅ Types for budget
export interface BudgetOption {
  total?: number; // present in budget, moderate, luxury
  min?: number; // present in custom
  max?: number; // present in custom
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
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<PlanningStep>("hero");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDestinationDetails, setSelectedDestinationDetails] = useState<Destination | null>(null);
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
  const tripsSectionRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const {
    data: trips,
    isLoading: tripsLoading,
    error: tripsError,
  } = useQuery<Trip[]>({
    queryKey: ["userTrips", user?.uid],
    queryFn: () => getUserTrips(user!.uid),
    enabled: !!isAuthenticated && !!user, // only fetch when logged in
  });
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
      const response = await getTripItineraries(currentTripId!);
      setItineraries(response);
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
            travelMode:
              selectedTravelMode as EstimateBudgetRequest["travelMode"],
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
  const mock_trips = [
    {
      id: "1",
      destination: "TamilNadu",
      description: "Tamilnadu temples",
      budget: 11550,
      duration: 7,
      moods: ["Culture", "Relax", "Adventure", "Discovery"],
      travelMode: "ownBike",
      tripType: "solo",
    },
    {
      id: "2",
      destination: "Kerala",
      description: "Backwaters and greenery",
      budget: 14500,
      duration: 6,
      moods: ["Relax", "Discovery"],
      travelMode: "train",
      tripType: "group",
    },
  ];

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
      // Destination type fields
      fullName: "Tamil Nadu, India",
      lat: 10.7905,
      lon: 78.7047,
      placeId: "ChIJyWEHuEmuEmsRm9hTkapTCrk", // Example, replace as needed
      type: "region",
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
      fullName: "Kerala, India",
      lat: 9.9312,
      lon: 76.2673,
      placeId: "ChIJL_P_CXMEDTkRw0ZdG-0GVvw", // Example, replace as needed
      type: "region",
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
      fullName: "Coorg, Karnataka, India",
      lat: 12.3375,
      lon: 75.8069,
      placeId: "ChIJw3t8QwQFrjsRjN1lQ4v6A2A", // Example, replace as needed
      type: "region",
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
      fullName: "Puducherry, India",
      lat: 11.9416,
      lon: 79.8083,
      placeId: "ChIJdUyx15R2UjoRkM2MIXVWBAQ", // Example, replace as needed
      type: "city",
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
      fullName: "Andaman and Nicobar Islands, India",
      lat: 11.7401,
      lon: 92.6586,
      placeId: "ChIJw2w3uLw1XToRrQ1Q1Q1Q1Q1", // Example, replace as needed
      type: "region",
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
      fullName: "Hampi, Karnataka, India",
      lat: 15.3350,
      lon: 76.4600,
      placeId: "ChIJrQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1", // Example, replace as needed
      type: "city",
    },
  ];

  const handleDestinationSelect = (destination: string, destinationDetails: Destination) => {
    setSelectedDestination(destination);
    setSelectedDestinationDetails(destinationDetails);
    setCurrentStep("preferences");
    console.log("Starting planning for:", destination);
  };
  const handleTripSelect = (id: string) => {
    console.log("Trip selected:", id);
    // You can navigate, open modal, or update state here
  };
  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((id) => id !== moodId)
        : [...prev, moodId]
    );
  };
  // generate itinerary TODO
  const handleGenerateItinerary = async () => {
    try {
      setCurrentStep("itinerary");
      if (!selectedDestinationDetails) {
        toast({
          title: "Missing Destination Details",
          description: "Please select a destination to continue.",
          variant: "destructive",
        });
        return;
      }
      const tripData = {
        destination: selectedDestination,
        description: `Trip to ${selectedDestination}`,
        destinationDetails: selectedDestinationDetails,
        duration: tripDuration,
        moods: selectedMoods,
        tripType: tripType || "solo",
        travelMode: selectedTravelMode,
        budget: estimatedBudget > 0 ? estimatedBudget.toString() : undefined,
        startDate: selectedDates || undefined,
        status: "planning",
        userId: user?.uid || null,
      };

      const trip = await createTripMutation.mutateAsync(tripData);
      const response = await generateItineraryMutation.mutateAsync(trip.id);

      // Defensive: check if response is valid JSON/object
      if (!response || typeof response !== "object") {
        toast({
          title: "Itinerary Generation Failed",
          description: "No itinerary data was returned. Please try again.",
          variant: "destructive",
        });
        return;
      } else {
        updateTripItineraries(trip.id, response);
      }
    } catch (error) {
      console.error("Error in trip planning flow:", error);
      toast({
        title: "Error",
        description:
          "There was a problem generating your itinerary. Please try again.",
        variant: "destructive",
      });
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
            {/* Your trips */}
            <section id="trips" className="w-full container px-6 py-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Your Trips</h2>
                <p className="text-muted-foreground">
                  View and manage your upcoming and past trips
                </p>
              </div>

              {(() => {
                if (tripsLoading) {
                  return (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading your trips...</span>
                    </div>
                  );
                } else if (tripsError) {
                  return (
                    <div className="text-center text-red-500">
                      Failed to load trips. Please try again later.
                    </div>
                  );
                } else if (trips && trips.length > 0) {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                      {trips.map((trip) => (
                        <TripCard
                          key={trip.id}
                          id={trip.id}
                          destination={trip.destination}
                          description={trip.description ?? ""}
                          duration={trip.duration}
                          moods={trip.moods}
                          budget={Number(trip?.budget) || 0}
                          travelMode={trip.travelMode ?? "unknown"}
                          tripType={trip.tripType ?? "solo"}
                          onClick={(id) => handleTripSelect(id)}
                        />
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>You don’t have any saved trips yet.</p>
                      <Button
                        className="mt-4"
                        onClick={() =>
                          tripsSectionRef.current?.scrollIntoView({
                            behavior: "smooth",
                          })
                        }
                      >
                        Start Planning
                      </Button>
                    </div>
                  );
                }
              })()}
            </section>
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
                    onClick={() => handleDestinationSelect(dest.name, dest)}
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
                  <WeatherSuggestion
                    destination={selectedDestination}
                    destinationDetails={selectedDestinationDetails}
                    onDateSelect={setSelectedDates}
                  />
                </Card>
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
            {/* Additional Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover-elevate">
                <Users className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold mb-2">Collaborative Planning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite friends and plan together
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Group planning")}
                >
                  Coming Soon
                </Button>
              </Card>

              <Card className="p-6 text-center hover-elevate">
                <Download className="h-8 w-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Offline Access</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download for offline use
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Offline download")}
                >
                  Coming Soon
                </Button>
              </Card>

              <Card className="p-6 text-center hover-elevate">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">AI Plan B</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-time adaptive suggestions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("AI Plan B")}
                >
                  Coming Soon
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
