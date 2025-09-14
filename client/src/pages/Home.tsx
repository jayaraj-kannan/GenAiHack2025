import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { MoodSelector } from "@/components/MoodSelector";
import { TripDurationPicker } from "@/components/TripDurationPicker"; 
import { WeatherSuggestion } from "@/components/WeatherSuggestion";
import { BudgetEstimator } from "@/components/BudgetEstimator";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";
import { DestinationCard } from "@/components/DestinationCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Users, Download, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createTrip, generateItinerary, getTrip, getTripItineraries, type Trip, type Itinerary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import cultureImage from "@assets/generated_images/Cultural_heritage_destination_card_7c712f33.png";
import adventureImage from "@assets/generated_images/Adventure_travel_destination_card_8cbc5aee.png";
import relaxImage from "@assets/generated_images/Relaxation_spa_destination_card_c8d484c2.png";

type PlanningStep = "hero" | "preferences" | "suggestions" | "itinerary";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<PlanningStep>("hero");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [tripDuration, setTripDuration] = useState(7);
  const [selectedDates, setSelectedDates] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState(0);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const { toast } = useToast();

  // React Query hooks for API calls
  const { data: currentTrip } = useQuery({
    queryKey: ["trip", currentTripId],
    queryFn: () => getTrip(currentTripId!),
    enabled: !!currentTripId,
  });

  const { data: itineraries = [] } = useQuery({
    queryKey: ["itineraries", currentTripId],
    queryFn: () => getTripItineraries(currentTripId!),
    enabled: !!currentTripId,
  });

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
    onSuccess: () => {
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

  const featuredDestinations = [
    {
      id: "culture",
      name: "Cultural Heritage",
      image: cultureImage,
      description: "Explore ancient temples and traditional architecture",
      rating: 4.8,
      duration: "5-7 days",
      price: 850,
      mood: "Culture"
    },
    {
      id: "adventure",
      name: "Mountain Adventure", 
      image: adventureImage,
      description: "Thrilling outdoor activities and scenic trekking",
      rating: 4.9,
      duration: "7-10 days",
      price: 1200,
      mood: "Adventure"
    },
    {
      id: "relax",
      name: "Wellness Retreat",
      image: relaxImage,
      description: "Peaceful spa treatments and meditation experiences",
      rating: 4.7,
      duration: "4-6 days", 
      price: 950,
      mood: "Relax"
    }
  ];

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentStep("preferences");
    console.log("Starting planning for:", destination);
  };

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleGenerateItinerary = async () => {
    try {
      // First create the trip
      const tripData = {
        destination: selectedDestination,
        duration: tripDuration,
        moods: selectedMoods,
        budget: estimatedBudget > 0 ? estimatedBudget.toString() : undefined,
        startDate: selectedDates || undefined,
        status: "planning",
      };
      
      const trip = await createTripMutation.mutateAsync(tripData);
      
      // Then generate the AI itinerary
      await generateItineraryMutation.mutateAsync(trip.id);
    } catch (error) {
      console.error("Error in trip planning flow:", error);
    }
  };

  const handleBookNow = () => {
    console.log("Initiating booking process");
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TripCraft</span>
            <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {currentStep !== "hero" && (
              <Button 
                variant="ghost" 
                onClick={handleBackToSearch}
                data-testid="button-back-to-search"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentStep === "hero" && (
          <div className="space-y-12">
            <HeroSection onGetStarted={handleDestinationSelect} />
            
            {/* Featured Destinations */}
            <section className="container px-6 py-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Popular Experiences</h2>
                <p className="text-muted-foreground">Curated trips based on different travel moods</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {featuredDestinations.map(dest => (
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
          <div className="container px-6 py-12 max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Customize Your {selectedDestination} Trip</h1>
                <p className="text-muted-foreground">Tell us your preferences for a personalized experience</p>
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
                  <BudgetEstimator
                    destination={selectedDestination}
                    duration={tripDuration}
                    moods={selectedMoods}
                    onBudgetChange={setEstimatedBudget}
                  />
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
                  disabled={selectedMoods.length === 0 || createTripMutation.isPending || generateItineraryMutation.isPending}
                  className="px-8 py-3 text-lg"
                  data-testid="button-generate-itinerary"
                >
                  {(createTripMutation.isPending || generateItineraryMutation.isPending) ? (
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
                days={itineraries.map(itinerary => ({
                  day: itinerary.day,
                  date: itinerary.date,
                  activities: itinerary.activities,
                  totalCost: parseFloat(itinerary.totalCost)
                }))}
                totalBudget={parseFloat(currentTrip.budget || "0")}
                onBookNow={handleBookNow}
                onModifyItinerary={() => setCurrentStep("preferences")}
              />
            ) : (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Loading your personalized itinerary...</p>
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
                <Button variant="outline" size="sm" onClick={() => console.log("Group planning")}>
                  Coming Soon
                </Button>
              </Card>

              <Card className="p-6 text-center hover-elevate">
                <Download className="h-8 w-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Offline Access</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download for offline use
                </p>
                <Button variant="outline" size="sm" onClick={() => console.log("Offline download")}>
                  Download
                </Button>
              </Card>

              <Card className="p-6 text-center hover-elevate">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">AI Plan B</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-time adaptive suggestions
                </p>
                <Button variant="outline" size="sm" onClick={() => console.log("AI Plan B")}>
                  Enable
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}