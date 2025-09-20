export interface Destination {
  name: string;
  fullName: string;
  lat: number;
  lon: number;
  placeId: string; // ✅ fixed camelCase to match common convention
  type: string;    // e.g. "city"
}