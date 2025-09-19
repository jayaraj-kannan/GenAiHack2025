import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  destination: text("destination").notNull(),
  duration: integer("duration").notNull(), // days
  moods: text("moods").array().notNull(), // travel moods
  travelMode: text("travel_mode"), // new field for travel mode
  tripType: text("trip_type"), // new field for trip type
  budget: decimal("budget", { precision: 10, scale: 2 }),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").notNull().default("planning"), // planning, booked, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itineraries = pgTable("itineraries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  day: integer("day").notNull(),
  date: text("date").notNull(),
  activities: jsonb("activities").notNull(), // array of activity objects
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  bookedAt: timestamp("booked_at").defaultNow(),
});

// Schema exports for forms
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
