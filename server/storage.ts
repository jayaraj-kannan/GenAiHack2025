import { type User, type InsertUser, type Trip, type InsertTrip, type Itinerary, type InsertItinerary, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for trip planner functionality
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trip methods
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: string): Promise<Trip | undefined>;
  getUserTrips(userId: string): Promise<Trip[]>;
  updateTrip(id: string, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  
  // Itinerary methods
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  getTripItineraries(tripId: string): Promise<Itinerary[]>;
  updateItinerary(id: string, itinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getTripBookings(tripId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trips: Map<string, Trip>;
  private itineraries: Map<string, Itinerary>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.itineraries = new Map();
    this.bookings = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Trip methods
  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const now = new Date();
    const trip: Trip = { 
      ...insertTrip, 
      id,
      userId: null, // Will be set when user auth is implemented
      createdAt: now,
      updatedAt: now
    };
    this.trips.set(id, trip);
    return trip;
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId === userId);
  }

  async updateTrip(id: string, updates: Partial<InsertTrip>): Promise<Trip | undefined> {
    const existing = this.trips.get(id);
    if (!existing) return undefined;
    
    const updated: Trip = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.trips.set(id, updated);
    return updated;
  }

  // Itinerary methods
  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = randomUUID();
    const itinerary: Itinerary = { 
      ...insertItinerary, 
      id,
      createdAt: new Date()
    };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async getTripItineraries(tripId: string): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values())
      .filter(itinerary => itinerary.tripId === tripId)
      .sort((a, b) => a.day - b.day);
  }

  async updateItinerary(id: string, updates: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const existing = this.itineraries.get(id);
    if (!existing) return undefined;
    
    const updated: Itinerary = { ...existing, ...updates };
    this.itineraries.set(id, updated);
    return updated;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id,
      status: insertBooking.status || "pending",
      bookedAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getTripBookings(tripId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.tripId === tripId);
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const existing = this.bookings.get(id);
    if (!existing) return undefined;
    
    const updated: Booking = { ...existing, status };
    this.bookings.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
