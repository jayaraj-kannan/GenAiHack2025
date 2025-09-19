import { useState, useEffect } from "react";
import { Hotel, MapPin, Calendar, Users, Star, ExternalLink, CreditCard, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingOption {
  id: string;
  name: string;
  type: "hotel" | "apartment" | "hostel" | "resort";
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  amenities: string[];
  location: string;
  cancellationPolicy: string;
  bookingUrl: string;
  provider: string;
}

interface BookingIntegrationProps {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  budget: number;
  onBookingSelect: (booking: BookingOption) => void;
}

export function BookingIntegration({ 
  destination, 
  checkIn, 
  checkOut, 
  guests, 
  budget, 
  onBookingSelect 
}: BookingIntegrationProps) {
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price");
  const [maxPrice, setMaxPrice] = useState(budget || 200);

  // Mock booking options - in a real implementation, this would call multiple booking APIs
  const generateMockBookings = (): BookingOption[] => {
    const basePrice = budget ? budget * 0.4 : 150; // 40% of budget for accommodation
    return [
      {
        id: "hotel-1",
        name: "Grand Plaza Hotel",
        type: "hotel",
        price: Math.round(basePrice * 1.2),
  currency: "INR",
        rating: 4.5,
        reviewCount: 1248,
        image: "/api/placeholder/hotel-1",
        amenities: ["Free WiFi", "Pool", "Gym", "Restaurant", "24/7 Room Service"],
        location: `Downtown ${destination}`,
        cancellationPolicy: "Free cancellation until 24h before check-in",
        bookingUrl: "https://booking.example.com/hotel-1",
        provider: "Booking.com"
      },
      {
        id: "apartment-1", 
        name: "Modern City Apartment",
        type: "apartment",
        price: Math.round(basePrice * 0.8),
  currency: "INR",
        rating: 4.3,
        reviewCount: 567,
        image: "/api/placeholder/apartment-1",
        amenities: ["Kitchen", "WiFi", "Washing Machine", "City View"],
        location: `Central ${destination}`,
        cancellationPolicy: "Free cancellation until 48h before check-in",
        bookingUrl: "https://airbnb.example.com/apartment-1",
        provider: "Airbnb"
      },
      {
        id: "hostel-1",
        name: "Backpacker's Haven",
        type: "hostel", 
        price: Math.round(basePrice * 0.3),
  currency: "INR",
        rating: 4.0,
        reviewCount: 892,
        image: "/api/placeholder/hostel-1",
        amenities: ["Free WiFi", "Common Kitchen", "Laundry", "24/7 Reception"],
        location: `Old Town ${destination}`,
        cancellationPolicy: "Free cancellation until 72h before check-in",
        bookingUrl: "https://hostelworld.example.com/hostel-1",
        provider: "Hostelworld"
      },
      {
        id: "resort-1",
        name: "Luxury Beach Resort",
        type: "resort",
        price: Math.round(basePrice * 2.5),
  currency: "INR", 
        rating: 4.8,
        reviewCount: 2104,
        image: "/api/placeholder/resort-1",
        amenities: ["All-Inclusive", "Private Beach", "Spa", "Multiple Restaurants", "Golf Course"],
        location: `Beach District ${destination}`,
        cancellationPolicy: "Free cancellation until 7 days before check-in",
        bookingUrl: "https://resort.example.com/resort-1",
        provider: "Expedia"
      }
    ];
  };

  useEffect(() => {
    if (destination && checkIn && checkOut) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const mockBookings = generateMockBookings();
        setBookingOptions(mockBookings);
        setLoading(false);
      }, 1000);
    }
  }, [destination, checkIn, checkOut, guests, budget]);

  const filteredAndSortedOptions = bookingOptions
    .filter(option => {
      if (filterType !== "all" && option.type !== filterType) return false;
      if (option.price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : i < rating 
              ? "fill-yellow-200 text-yellow-400" 
              : "text-gray-300"
        }`}
      />
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel": return <Hotel className="h-4 w-4" />;
      case "apartment": return <MapPin className="h-4 w-4" />;
      default: return <Hotel className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hotel": return "bg-blue-100 text-blue-800";
      case "apartment": return "bg-green-100 text-green-800";
      case "hostel": return "bg-orange-100 text-orange-800";
      case "resort": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Hotel className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">Finding the best accommodations...</p>
          <p className="text-sm text-muted-foreground">Searching across multiple booking platforms</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Hotel className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Hotel & Accommodation Booking</h3>
      </div>

      {/* Search Info */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{destination}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{checkIn} - {checkOut}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{guests} guest{guests > 1 ? 's' : ''}</span>
          </div>
        </div>
      </Card>

      {/* Filters and Sort */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Accommodation Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="type-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="apartment">Apartments</SelectItem>
                <SelectItem value="hostel">Hostels</SelectItem>
                <SelectItem value="resort">Resorts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort-by">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="rating">Rating (High to Low)</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max Price per Night</Label>
            <Input
              id="max-price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              min="0"
              max="1000"
            />
          </div>
        </div>
      </Card>

      {/* Booking Options */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Found {filteredAndSortedOptions.length} accommodation{filteredAndSortedOptions.length !== 1 ? 's' : ''} matching your criteria
        </p>
        
        {filteredAndSortedOptions.map((option) => (
          <Card key={option.id} className="overflow-hidden hover-elevate">
            <div className="md:flex">
              <div className="md:w-64 h-48 bg-muted flex items-center justify-center">
                <Hotel className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{option.name}</h4>
                      <Badge className={getTypeColor(option.type)}>
                        {getTypeIcon(option.type)}
                        <span className="ml-1 capitalize">{option.type}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(option.rating)}
                      </div>
                      <span className="text-sm font-medium">{option.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({option.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{option.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {option.amenities.slice(0, 4).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {option.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{option.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Shield className="h-4 w-4" />
                      <span>{option.cancellationPolicy}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{option.price}
                      </div>
                      <div className="text-sm text-muted-foreground">per night</div>
                      <div className="text-xs text-muted-foreground">via {option.provider}</div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => onBookingSelect(option)}
                        className="w-full"
                        data-testid={`select-booking-${option.id}`}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Select & Book
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(option.bookingUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on {option.provider}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAndSortedOptions.length === 0 && (
        <Card className="p-8 text-center">
          <Hotel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">No accommodations found</h4>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or increasing your budget
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterType("all");
              setMaxPrice(budget || 500);
            }}
          >
            Reset Filters
          </Button>
        </Card>
      )}
    </div>
  );
}