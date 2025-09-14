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

  // Weather-based travel date suggestions
  app.get("/api/destinations/:destination/best-dates", async (req, res) => {
    try {
      const { destination } = req.params;
      const { duration = 7 } = req.query;

      // Mock weather data - in production would integrate with real weather API
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

      res.json({
        destination,
        duration: parseInt(duration as string),
        recommendations: mockWeatherSuggestions,
        generated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching weather suggestions:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

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
