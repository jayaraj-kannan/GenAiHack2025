import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePersonalizedItinerary, generatePlanBSuggestions } from "./ai-service";
import { insertTripSchema, insertItinerarySchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();
export async function registerRoutes(app: Express): Promise<Server> {
  // Trip planning routes
  
  // Create a new trip
  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(400).json({ error: "Invalid trip data" });
    }
  });

  // Get a specific trip
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get trip itineraries
  app.get("/api/trips/:id/itineraries", async (req, res) => {
    try {
      const itineraries = await storage.getTripItineraries(req.params.id);
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI-powered itinerary generation
  app.post("/api/trips/:id/generate-itinerary", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      console.log("Generating itinerary for trip:", trip);
      // Generate AI itinerary
      const aiItinerary = await generatePersonalizedItinerary({
        destination: trip.destination,
        duration: trip.duration,
        moods: trip.moods,
        budget: trip.budget ? parseFloat(trip.budget) : undefined,
        startDate: trip.startDate || undefined,
        endDate: trip.endDate || undefined,
      });
 console.log("Save generated");
      // Save generated itinerary to storage
      const savedItineraries = [];
      for (const day of aiItinerary.days) {
        const itinerary = await storage.createItinerary({
          tripId: trip.id,
          day: day.day,
          date: day.date,
          activities: day.activities as any, // JSONB field
          totalCost: day.totalCost.toString(),
        });
        savedItineraries.push(itinerary);
      }

      // Update trip budget
      await storage.updateTrip(trip.id, {
        budget: aiItinerary.totalBudget.toString(),
      });

      res.json({
        trip: await storage.getTrip(trip.id),
        itineraries: savedItineraries,
        aiGenerated: true,
        weatherOptimized: aiItinerary.weatherOptimized,
        moodMatched: aiItinerary.moodMatched,
      });
      console.log("Itinerary generated for trip:", savedItineraries);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  // Generate Plan B suggestions for activities
  app.post("/api/activities/plan-b", async (req, res) => {
    try {
      const { activity, reason } = req.body;
      
      if (!activity || !reason) {
        return res.status(400).json({ error: "Activity and reason are required" });
      }

      const suggestions = await generatePlanBSuggestions(activity, reason);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating Plan B:", error);
      res.status(500).json({ error: "Failed to generate alternative suggestions" });
    }
  });

  // Destination search autocomplete endpoint
  // Destination search autocomplete endpoint with Google Place Details
app.get("/api/destinations/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string" || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    // Step 1: Call Google Places Autocomplete
    const autoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=(cities)&key=${googleApiKey}`;

    const autoResp = await fetch(autoUrl);
    if (!autoResp.ok) throw new Error("Google Autocomplete API unavailable");

    const autoData = await autoResp.json();
    if (autoData.status !== "OK") {
      throw new Error(`Google Autocomplete error: ${autoData.status}`);
    }

    // Step 2: Resolve each prediction with Place Details (lat/lng)
    const suggestions: any[] = [];
    for (const prediction of autoData.predictions.slice(0, 5)) {
      const placeId = prediction.place_id;

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${googleApiKey}`;
      const detailsResp = await fetch(detailsUrl);
      if (!detailsResp.ok) continue;

      const detailsData = await detailsResp.json();
      if (detailsData.status !== "OK") continue;

      const place = detailsData.result;
      suggestions.push({
        name: place.name,
        fullName: place.formatted_address,
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
        placeId,
        type: "city",
      });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Error in destination search:", error);
    res.status(500).json({ error: "Failed to search destinations" });
  }
});


  // Weather-based travel date suggestions with AI scoring
  app.get("/api/destinations/:destination/best-dates", async (req, res) => {
    try {
      const { destination } = req.params;
      const { duration = 7 } = req.query;

      if (!process.env.WEATHER_API_KEY) {
        // Fallback to enhanced mock data if no API key
        const mockWeatherSuggestions = [
          {
            dateRange: "Sep 15-17",
            condition: "Mostly Sunny",
            temperature: 24,
            score: 95,
            description: "Perfect weather conditions for outdoor activities"
          },
          {
            dateRange: "Sep 20-22",
            condition: "Partly Cloudy", 
            temperature: 22,
            score: 85,
            description: "Good weather with occasional clouds"
          },
          {
            dateRange: "Sep 25-27",
            condition: "Light Rain",
            temperature: 19,
            score: 65,
            description: "Some rain expected, better for indoor activities"
          }
        ];

        return res.json({
          destination,
          duration: parseInt(duration as string),
          recommendations: mockWeatherSuggestions,
          generated: new Date().toISOString(),
          source: "mock"
        });
      }

      // Get weather forecast from WeatherAPI.com
      const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(destination)}&days=14&aqi=no&alerts=no`;
      
      try {
        const weatherResponse = await fetch(weatherApiUrl);
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        console.log("Weather data:", weatherData);
        const forecast = weatherData.forecast?.forecastday || [];
        
        // Generate 3-day windows with AI scoring algorithm
        const recommendations = [];
        for (let i = 0; i <= forecast.length - 3; i++) {
          const window = forecast.slice(i, i + 3);
          const score = calculateWeatherScore(window);
          const startDate = new Date(window[0].date);
          const endDate = new Date(window[2].date);
          
          recommendations.push({
            dateRange: `${formatDateRange(startDate)} - ${formatDateRange(endDate)}`,
            condition: getMostSignificantCondition(window),
            temperature: Math.round(window.reduce((sum, day) => sum + day.day.avgtemp_c, 0) / 3),
            score: Math.round(score),
            description: generateWeatherDescription(window, score)
          });
        }
        
        // Sort by score (best first) and take top 3
        recommendations.sort((a, b) => b.score - a.score);
        const topRecommendations = recommendations.slice(0, 3);

        res.json({
          destination: weatherData.location?.name || destination,
          duration: parseInt(duration as string),
          recommendations: topRecommendations,
          generated: new Date().toISOString(),
          source: "weatherapi"
        });
      } catch (error) {
        console.error('WeatherAPI error:', error);
        // Fallback to mock data on API failure
        const fallbackSuggestions = [
          {
            dateRange: "Oct 15-17",
            condition: "Partly Sunny",
            temperature: 22,
            score: 85,
            description: "Generally good weather expected"
          },
          {
            dateRange: "Oct 20-22",
            condition: "Mostly Cloudy", 
            temperature: 20,
            score: 70,
            description: "Overcast but mild conditions"
          },
          {
            dateRange: "Oct 25-27",
            condition: "Light Showers",
            temperature: 18,
            score: 60,
            description: "Some rain possible, plan indoor activities"
          }
        ];

        res.json({
          destination,
          duration: parseInt(duration as string),
          recommendations: fallbackSuggestions,
          generated: new Date().toISOString(),
          source: "fallback"
        });
      }
    } catch (error) {
      console.error("Error fetching weather suggestions:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Helper functions for weather scoring
  function calculateWeatherScore(threeDayWindow: any[]): number {
    let score = 100;
    
    for (const day of threeDayWindow) {
      const dayData = day.day;
      
      // Temperature scoring (20-25°C is optimal)
      const temp = dayData.avgtemp_c;
      if (temp < 10 || temp > 35) score -= 20;
      else if (temp < 15 || temp > 30) score -= 10;
      else if (temp >= 20 && temp <= 25) score += 5;
      
      // Precipitation scoring
      const rainMm = dayData.totalprecip_mm || 0;
      if (rainMm > 20) score -= 25;
      else if (rainMm > 10) score -= 15;
      else if (rainMm > 5) score -= 8;
      else if (rainMm < 1) score += 5;
      
      // Wind scoring
      const windKph = dayData.maxwind_kph || 0;
      if (windKph > 50) score -= 20;
      else if (windKph > 30) score -= 10;
      else if (windKph < 15) score += 3;
      
      // Humidity scoring
      const humidity = dayData.avghumidity || 50;
      if (humidity > 80) score -= 10;
      else if (humidity < 30) score -= 5;
      
      // UV Index scoring (moderate UV is good)
      const uvIndex = dayData.uv || 5;
      if (uvIndex > 10) score -= 10;
      else if (uvIndex >= 3 && uvIndex <= 7) score += 3;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  function getMostSignificantCondition(window: any[]): string {
    const conditions = window.map(day => day.day.condition.text);
    // Return the most concerning condition or the first one
    for (const condition of conditions) {
      if (condition.toLowerCase().includes('rain') || 
          condition.toLowerCase().includes('storm') ||
          condition.toLowerCase().includes('snow')) {
        return condition;
      }
    }
    return conditions[0] || 'Variable';
  }

  function generateWeatherDescription(window: any[], score: number): string {
    const avgTemp = window.reduce((sum, day) => sum + day.day.avgtemp_c, 0) / 3;
    const totalRain = window.reduce((sum, day) => sum + (day.day.totalprecip_mm || 0), 0);
    
    if (score >= 90) {
      return "Excellent weather conditions for all outdoor activities";
    } else if (score >= 75) {
      return totalRain > 5 ? "Good weather with occasional light rain" : "Generally pleasant conditions";
    } else if (score >= 60) {
      return totalRain > 15 ? "Moderate rain expected, mix of indoor/outdoor activities" : "Average weather conditions";
    } else {
      return totalRain > 20 ? "Significant rain likely, focus on indoor attractions" : "Challenging weather conditions";
    }
  }

  function formatDateRange(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Booking endpoints
  app.post("/api/trips/:id/bookings", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      const bookingData = insertBookingSchema.parse({
        ...req.body,
        tripId: req.params.id,
      });

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  // Get trip bookings
  app.get("/api/trips/:id/bookings", async (req, res) => {
    try {
      const bookings = await storage.getTripBookings(req.params.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
