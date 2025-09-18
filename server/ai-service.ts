import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
console.log("GOOGLE_AI_API_KEY:", process.env.GOOGLE_AI_API_KEY);
// Trip planner AI service using Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });

export interface TripPreferences {
  destination: string;
  duration: number; // days
  moods: string[]; // relax, adventure, culture, discovery
  travelMode?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
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

export interface ItineraryDay {
  day: number;
  date: string;
  activities: Activity[];
  totalCost: number;
}

export interface GeneratedItinerary {
  destination: string;
  totalBudget: number;
  days: ItineraryDay[];
  weatherOptimized: boolean;
  moodMatched: string[];
}

export async function generatePersonalizedItinerary(preferences: TripPreferences): Promise<GeneratedItinerary> {
  try {
    const moodDescriptions = {
      relax: "peaceful, spa treatments, wellness activities, slow-paced experiences, nature walks, meditation",
      adventure: "thrilling activities, outdoor sports, hiking, trekking, adrenaline-pumping experiences",
      culture: "historical sites, museums, local traditions, authentic food experiences, art galleries, cultural tours",
      discovery: "hidden gems, off-the-beaten-path locations, local experiences, unique attractions, secret spots"
    };

    const selectedMoodDescriptions = preferences.moods.map(mood => moodDescriptions[mood as keyof typeof moodDescriptions]).join(", ");

    const systemPrompt = `You are an expert travel planner AI. Create detailed, personalized itineraries based on traveler preferences. 
Focus on authentic experiences, optimal timing, and budget consciousness.

Requirements:
- Generate realistic activities with accurate timing and costs
- Match activities to specified moods: ${selectedMoodDescriptions}
- Include variety in each day (culture, food, activities)
- Provide specific locations and descriptions
- Ensure activities are logically sequenced by time and location
- Include realistic travel times between activities
- Include the unique places based on the travel mode: ${preferences.travelMode || "flexible"}
- Balance indoor/outdoor activities based on typical weather patterns`;

    const prompt = `Create a detailed ${preferences.duration}-day itinerary for ${preferences.destination} with travel mode ${preferences.travelMode || "flexible"}.

Travel Preferences:
- Duration: ${preferences.duration} days
- Mood preferences: ${preferences.moods.join(", ")}
- Travel mode preferences: ${preferences.travelMode || "flexible"}
- Budget range: ${preferences.budget ? `$${preferences.budget}` : "moderate budget"}
- Travel dates: ${preferences.startDate || "flexible dates"}

Please create a detailed itinerary with:
1. Daily schedule with specific times
2. Activity names, locations, and descriptions
3. Estimated costs for each activity
4. Duration for each activity
5. Activity types (Culture, Adventure, Food, Relaxation, etc.)
6. Total daily costs

Format the response as JSON with this structure:
{
  "destination": "${preferences.destination}",
  "totalBudget": number,
  "days": [
    {
      "day": 1,
      "date": "Date string",
      "activities": [
        {
          "id": "unique_id",
          "time": "9:00 AM",
          "title": "Activity Name",
          "location": "Specific Location",
          "duration": "2 hours",
          "cost": 25,
          "type": "Culture",
          "description": "Detailed description"
        }
      ],
      "totalCost": number
    }
  ],
  "weatherOptimized": true,
  "moodMatched": ["mood1", "mood2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from AI model");
    }

    const itinerary: GeneratedItinerary = JSON.parse(rawJson);
    
    // Validate the response structure
    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      throw new Error("Invalid itinerary structure returned from AI");
    }

    // Ensure each activity has a unique ID
    itinerary.days.forEach((day, dayIndex) => {
      day.activities.forEach((activity, activityIndex) => {
        if (!activity.id) {
          activity.id = `day${dayIndex + 1}_activity${activityIndex + 1}`;
        }
      });
    });
    console.log("Generated Itinerary:", itinerary);
    return itinerary;

  } catch (error) {
    console.error("Failed to generate itinerary:", error);
    
    // Fallback itinerary if AI fails
    return generateFallbackItinerary(preferences);
  }
}

function generateFallbackItinerary(preferences: TripPreferences): GeneratedItinerary {
  const fallbackDays: ItineraryDay[] = [];
  
  for (let day = 1; day <= preferences.duration; day++) {
    const activities: Activity[] = [
      {
        id: `day${day}_morning`,
        time: "9:00 AM",
        title: `${preferences.destination} Exploration`,
        location: preferences.destination,
        duration: "3 hours",
        cost: 50,
        type: preferences.moods[0] || "Culture",
        description: `Discover the highlights of ${preferences.destination} with a focus on ${preferences.moods.join(" and ")} experiences.`
      },
      {
        id: `day${day}_afternoon`,
        time: "2:00 PM", 
        title: "Local Cuisine Experience",
        location: `Traditional Restaurant in ${preferences.destination}`,
        duration: "1.5 hours",
        cost: 35,
        type: "Food",
        description: "Enjoy authentic local dishes and regional specialties."
      }
    ];

    fallbackDays.push({
      day,
      date: `Day ${day}`,
      activities,
      totalCost: activities.reduce((sum, activity) => sum + activity.cost, 0)
    });
  }

  return {
    destination: preferences.destination,
    totalBudget: fallbackDays.reduce((sum, day) => sum + day.totalCost, 0),
    days: fallbackDays,
    weatherOptimized: false,
    moodMatched: preferences.moods
  };
}

export async function generatePlanBSuggestions(
  originalActivity: Activity, 
  reason: string
): Promise<Activity[]> {
  try {
    const systemPrompt = `You are a travel assistant providing alternative activity suggestions. 
When travelers face issues like weather, closures, or delays, suggest 3 nearby alternatives.`;

    const prompt = `The original activity "${originalActivity.title}" at ${originalActivity.location} cannot proceed due to: ${reason}

Please suggest 3 alternative activities in the same area with similar duration and cost range.
Consider the time of day (${originalActivity.time}) and activity type (${originalActivity.type}).

Format as JSON array:
[
  {
    "id": "alt_1",
    "time": "${originalActivity.time}",
    "title": "Alternative Activity Name",
    "location": "Nearby Location",
    "duration": "${originalActivity.duration}",
    "cost": ${originalActivity.cost},
    "type": "${originalActivity.type}",
    "description": "Why this is a good alternative"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      return [];
    }

    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Failed to generate Plan B suggestions:", error);
    return [];
  }
}