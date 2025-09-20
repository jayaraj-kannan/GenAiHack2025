import {
  type User, type InsertUser,
  type Trip, type InsertTrip,
  type Itinerary, type InsertItinerary,
  type Booking, type InsertBooking
} from "@shared/schema";
import { db } from "./server_firebase"
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where
} from "firebase/firestore";
import { randomUUID } from "crypto";

export class FirebaseStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const ref = doc(db, "users", id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    if (snap.empty) return undefined;
    return snap.docs[0].data() as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    await setDoc(doc(db, "users", id), user);
    return user;
  }

  // Trip methods
  async createTrip(userId: string, insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const now = new Date();
    const trip: Trip = {
      id,
      userId,
      destination: insertTrip.destination,
      destinationDetails: insertTrip.destinationDetails ?? null,
      description: insertTrip.description,
      duration: insertTrip.duration,
      moods: insertTrip.moods,
      travelMode: insertTrip.travelMode ?? null,
      tripType: insertTrip.tripType ?? null,
      budget: insertTrip.budget ?? null,
      startDate: insertTrip.startDate ?? null,
      endDate: insertTrip.endDate ?? null,
      status: insertTrip.status ?? "planned",
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "trips", id), trip);
    return trip;
  }

  // get trips for user
  async getTripsByUser(userId: string): Promise<Trip[]> {
    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("userId", "==", userId));
    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Trip[];
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const ref = doc(db, "trips", id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Trip) : undefined;
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    const q = query(collection(db, "trips"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Trip);
  }

  async updateTrip(id: string, updates: Partial<InsertTrip>): Promise<Trip | undefined> {
    const ref = doc(db, "trips", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    await updateDoc(ref, { ...updates, updatedAt: new Date() });
    const updatedSnap = await getDoc(ref);
    return updatedSnap.data() as Trip;
  }

  // Itinerary methods
  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = randomUUID();
    const itinerary: Itinerary = {
      ...insertItinerary,
      id,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "itineraries", id), itinerary);
    return itinerary;
  }

  async getTripItineraries(tripId: string): Promise<Itinerary[]> {
    const q = query(collection(db, "itineraries"), where("tripId", "==", tripId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => d.data() as Itinerary)
      .sort((a, b) => a.day - b.day);
  }

  async updateItinerary(id: string, updates: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const ref = doc(db, "itineraries", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    await updateDoc(ref, updates);
    const updatedSnap = await getDoc(ref);
    return updatedSnap.data() as Itinerary;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: insertBooking.status || "pending",
      bookedAt: new Date(),
      stripePaymentIntentId: insertBooking.stripePaymentIntentId ?? null,
    };
    await setDoc(doc(db, "bookings", id), booking);
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const ref = doc(db, "bookings", id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Booking) : undefined;
  }

  async getTripBookings(tripId: string): Promise<Booking[]> {
    const q = query(collection(db, "bookings"), where("tripId", "==", tripId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Booking);
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const ref = doc(db, "bookings", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    await updateDoc(ref, { status });
    const updatedSnap = await getDoc(ref);
    return updatedSnap.data() as Booking;
  }
}

export const storage = new FirebaseStorage();
