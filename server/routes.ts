import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePersonalizedItinerary, generatePlanBSuggestions } from "./ai-service";
import { insertTripSchema, insertItinerarySchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

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

      // Generate AI itinerary
      const aiItinerary = await generatePersonalizedItinerary({
        destination: trip.destination,
        duration: trip.duration,
        moods: trip.moods,
        budget: trip.budget ? parseFloat(trip.budget) : undefined,
        startDate: trip.startDate || undefined,
        endDate: trip.endDate || undefined,
      });

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
  app.get("/api/destinations/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string" || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      // Use OpenStreetMap Nominatim for free geocoding (respecting usage policy)
      const encodedQuery = encodeURIComponent(query);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=5&addressdetails=1&countrycodes=&featureType=city`;
      
      try {
        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'TripCraft-AI-Planner/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }
        
        const data = await response.json();
        
        const suggestions = data.map((item: any) => {
          const address = item.address || {};
          let displayName = '';
          
          if (address.city || address.town || address.village) {
            displayName = address.city || address.town || address.village;
            if (address.country) {
              displayName += `, ${address.country}`;
            }
          } else {
            // Fallback to display_name but clean it up
            displayName = item.display_name.split(',').slice(0, 2).join(', ');
          }
          
          return {
            name: displayName,
            fullName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type || 'city'
          };
        }).filter((item: any) => item.name && item.name.length > 0);

        res.json({ suggestions });
      } catch (error) {
        console.error('Geocoding API error:', error);
        // Fallback to enhanced mock data if geocoding fails
        const fallbackSuggestions = [
          { name: "Paris, France", fullName: "Paris, Île-de-France, France", lat: 48.8566, lon: 2.3522, type: "city" },
          { name: "Tokyo, Japan", fullName: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, type: "city" },
          { name: "New York, USA", fullName: "New York, New York, United States", lat: 40.7128, lon: -74.0060, type: "city" },
          { name: "London, England", fullName: "London, England, United Kingdom", lat: 51.5074, lon: -0.1278, type: "city" },
          { name: "Rome, Italy", fullName: "Rome, Lazio, Italy", lat: 41.9028, lon: 12.4964, type: "city" },
          { name: "Barcelona, Spain", fullName: "Barcelona, Catalonia, Spain", lat: 41.3851, lon: 2.1734, type: "city" },
          { name: "Mumbai, India", fullName: "Mumbai, Maharashtra, India", lat: 19.0760, lon: 72.8777, type: "city" },
          { name: "Sydney, Australia", fullName: "Sydney, New South Wales, Australia", lat: -33.8688, lon: 151.2093, type: "city" }
        ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        
        res.json({ suggestions: fallbackSuggestions });
      }
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
