import { apiRequest } from "./queryClient";

// Trip API endpoints
export interface CreateTripRequest {
  destination: string;
  duration: number;
  moods: string[];
  travelMode?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Trip {
  id: string;
  userId: string | null;
  destination: string;
  duration: number;
  moods: string[];
  budget: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  cost: number;
  type: string;
  description: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  day: number;
  date: string;
  activities: Activity[];
  totalCost: string;
  createdAt: Date | null;
}

export interface WeatherSuggestion {
  dateRange: string;
  condition: string;
  temperature: number;
  score: number;
  description: string;
}

// API functions
export async function createTrip(tripData: CreateTripRequest): Promise<Trip> {
  return apiRequest("/api/trips", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

export async function getTrip(tripId: string): Promise<Trip> {
  return apiRequest(`/api/trips/${tripId}`);
}

export async function getTripItineraries(tripId: string): Promise<Itinerary[]> {
  return apiRequest(`/api/trips/${tripId}/itineraries`);
}

export async function generateItinerary(tripId: string) {
  return apiRequest(`/api/trips/${tripId}/generate-itinerary`, {
    method: "POST",
  });
}

export async function getWeatherSuggestions(destination: string, duration: number = 7) {
  return apiRequest(`/api/destinations/${encodeURIComponent(destination)}/best-dates?duration=${duration}`);
}

export async function searchDestinations(query: string) {
  if (query.length < 2) {
    return { suggestions: [] };
  }
  return apiRequest(`/api/destinations/search?query=${encodeURIComponent(query)}`);
}

export async function generatePlanB(activity: Activity, reason: string) {
  return apiRequest("/api/activities/plan-b", {
    method: "POST",
    body: JSON.stringify({ activity, reason }),
  });
}

export async function createBooking(tripId: string, bookingData: any) {
  return apiRequest(`/api/trips/${tripId}/bookings`, {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}