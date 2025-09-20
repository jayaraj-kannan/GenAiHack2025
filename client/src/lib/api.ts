import { apiRequest } from "./queryClient";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import { Destination } from "./types";

// --- Trip API endpoints ---

export interface CreateTripRequest {
  destination: string;
  description: string;
  destinationDetails: Destination;
  duration: number;
  moods: string[];
  travelMode?: string;
  tripType?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  userId?: string | null;
}

export interface Trip {
  id: string;
  userId: string | null;
  destination: string;
  description: string;
  duration: number;
  moods: string[];
  budget: string | null;
  travelMode: string | null;
  tripType: string | null;
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

export type AuthUser = {
  name: string
  email: string
  avatar?: string
}

// --- Firebase Authentication ---

// Register new user
export async function register(email: string, password: string): Promise<UserCredential | void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    return userCredential;
  } catch (error: unknown) {
    handleError(error);
  }
}

// Login user
export async function login(email: string, password: string): Promise<UserCredential | void> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential;
  } catch (error: unknown) {
    handleError(error);
  }
}

// Google Sign-In
export async function signInWithGoogle(): Promise<UserCredential | void> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Google user:", result.user);
    return result;
  } catch (error: unknown) {
    handleError(error);
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    clearAuthenticatedUser();
    console.log("User signed out");
  } catch (error: unknown) {
    handleError(error);
  }
}

// Hook to track auth state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

// Get Authenticated User
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const user: AuthUser = {
      name: currentUser.displayName || currentUser.email?.split("@")[0] || "Unknown User",
      email: currentUser.email || "",
      avatar: currentUser.photoURL || undefined,
    };
    saveAuthenticatedUser(user);
    return user;
  }

  // fallback: check localStorage
  const storedUser = localStorage.getItem("auth_user");
  if (storedUser) {
    return JSON.parse(storedUser) as AuthUser;
  }

  return null;
}

// Local Storage helpers
export function saveAuthenticatedUser(user: AuthUser) {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearAuthenticatedUser() {
  localStorage.removeItem("auth_user");
}

// Error handler
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}

// --- NEW: Budget Estimation API ---
export interface EstimateBudgetRequest {
  destination: string;
  duration: number;
  moods?: string[];
  tripType?: "solo" | "group";
  travelMode?: "own car" | "public bus" | "train" | "flight" | "own bike" | "cab";
}

export interface EstimateBudgetResponse {
  budgetEstimation: {
    total: number;
    breakdown: Record<string, number>; // e.g. { transport: 1000, stay: 3000, food: 1500 }
  };
  aiGenerated: boolean;
}

export async function estimateBudget(
  data: EstimateBudgetRequest
): Promise<EstimateBudgetResponse> {
  return apiRequest("/api/estimate-budget", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export interface WeatherDay {
  date: string; // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
}

export interface WeatherResponse {
  forecastDays: WeatherDay[];
  timeZone: { id: string };
}

// Calls your backend /api/weather endpoint
export async function getWeatherForecast(
  lat: number,
  lon: number,
  days: number = 10
): Promise<WeatherResponse> {
  const data = await apiRequest(
    `/api/weather?lat=${lat}&lon=${lon}&days=${days}`
  );

  // 🔹 Normalize the Google Weather payload into something simpler
  const forecastDays: WeatherDay[] = (data.forecastDays || []).map((day: any) => ({
    date: `${day.displayDate.year}-${String(day.displayDate.month).padStart(2, "0")}-${String(day.displayDate.day).padStart(2, "0")}`,
    maxTemp: day.maxTemperature?.degrees ?? null,
    minTemp: day.minTemperature?.degrees ?? null,
    condition: day.daytimeForecast?.weatherCondition?.description?.text || "Unknown",
    icon: day.daytimeForecast?.weatherCondition?.iconBaseUri || "",
  }));

  return {
    forecastDays,
    timeZone: data.timeZone,
  };
}
// --- Existing APIs ---
export async function createTrip(tripData: CreateTripRequest): Promise<Trip> {
  return apiRequest("/api/trips", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}
// get trips for user
export async function getUserTrips(userId: string): Promise<Trip[]> {
  return apiRequest(`/api/users/${userId}/trips`);
}
export async function getTrip(tripId: string): Promise<Trip> {
  return apiRequest(`/api/trips/${tripId}`);
}
export async function getTrips(tripId: string): Promise<Trip> {
  return apiRequest(`/api/trips/${tripId}`);
}
export async function updateTripItineraries(tripId: string, itineraries: Itinerary[]): Promise<Itinerary[]> {
  return apiRequest(`/api/trips/${tripId}/itineraries`, {
    method: "POST",
    body: JSON.stringify(itineraries),
  });
}
export async function getTripItineraries(tripId: string): Promise<Itinerary[]> {
  return  apiRequest(`/api/trips/${tripId}/itineraries`);
}
export async function generateItinerary(tripId: string) {
  return apiRequest(`/api/trips/${tripId}/generate-itinerary`, {
    method: "POST",
  });
}

export async function getWeatherSuggestions(destination: string, duration: number = 20) {
  return apiRequest(
    `/api/destinations/${encodeURIComponent(destination)}/best-dates?duration=${duration}`
  );
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
