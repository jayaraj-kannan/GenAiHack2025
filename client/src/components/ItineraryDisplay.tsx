import { useState } from "react";
import { MapPin, Clock, DollarSign, Users, Calendar, Hotel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingIntegration } from "@/components/BookingIntegration";
import { Separator } from "@/components/ui/separator";

interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  cost: number;
  type: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
  totalCost: number;
}

interface ItineraryDisplayProps {
  destination: string;
  days: ItineraryDay[];
  totalBudget: number;
  onBookNow: () => void;
  onModifyItinerary: () => void;
}

export function ItineraryDisplay({ 
  destination, 
  days, 
  totalBudget, 
  onBookNow, 
  onModifyItinerary 
}: ItineraryDisplayProps) {
  const [showBooking, setShowBooking] = useState(false);
  
  const handleHotelBookingSelect = (booking: any) => {
    console.log('Hotel booking selected:', booking);
    setShowBooking(false);
    onBookNow();
  };
  
  // Calculate check-in and check-out dates from the itinerary
  const checkInDate = days.length > 0 ? days[0].date : new Date().toISOString().split('T')[0];
  const checkOutDate = days.length > 0 ? 
    new Date(new Date(days[days.length - 1].date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your {destination} Itinerary</h2>
            <p className="text-muted-foreground">AI-crafted journey for {days.length} days</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{totalBudget}</div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowBooking(true)} data-testid="button-book-hotels">
            <Hotel className="h-4 w-4 mr-2" />
            Book Hotels
          </Button>
          <Button onClick={onBookNow} data-testid="button-book-now">
            <DollarSign className="h-4 w-4 mr-2" />
            Complete Booking
          </Button>
          <Button variant="outline" onClick={onModifyItinerary} data-testid="button-modify-itinerary">
            Modify Itinerary
          </Button>
        </div>
      </div>

      <Separator />

      {/* Hotel Booking Section */}
      {showBooking && (
        <Card className="p-6">
          <BookingIntegration
            destination={destination}
            checkIn={checkInDate}
            checkOut={checkOutDate}
            guests={2}
            budget={Math.round(totalBudget * 0.4)}
            onBookingSelect={handleHotelBookingSelect}
          />
        </Card>
      )}

      {/* Days Timeline */}
      <div className="space-y-6">
        {days.map((day) => (
          <Card key={day.day} className="p-6" data-testid={`day-${day.day}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-semibold">Day {day.day}</h3>
                    <p className="text-sm text-muted-foreground">{day.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{day.totalCost}</div>
                  <p className="text-xs text-muted-foreground">Daily budget</p>
                </div>
              </div>

              <div className="space-y-3">
                {day.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 rounded-md bg-muted/30 hover-elevate">
                    <div className="flex-shrink-0 text-center min-w-[60px]">
                      <div className="text-sm font-medium">{activity.time}</div>
                      <div className="text-xs text-muted-foreground">{activity.duration}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {activity.location}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {activity.description}
                          </p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="font-medium">${activity.cost}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">${Math.round(totalBudget * 0.4)}</div>
            <div className="text-xs text-muted-foreground">Accommodation</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">${Math.round(totalBudget * 0.3)}</div>
            <div className="text-xs text-muted-foreground">Activities</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">${Math.round(totalBudget * 0.2)}</div>
            <div className="text-xs text-muted-foreground">Food</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">${Math.round(totalBudget * 0.1)}</div>
            <div className="text-xs text-muted-foreground">Transport</div>
          </div>
        </div>
      </Card>
    </div>
  );
}