import { ItineraryDisplay } from '../ItineraryDisplay';

export default function ItineraryDisplayExample() {
  const mockDays = [
    {
      day: 1,
      date: "Sept 15, 2024",
      totalCost: 280,
      activities: [
        {
          id: "1",
          time: "9:00 AM",
          title: "Eiffel Tower Visit",
          location: "Champ de Mars, Paris",
          duration: "2 hours",
          cost: 25,
          type: "Culture",
          description: "Skip-the-line tickets to the iconic Eiffel Tower with audio guide"
        },
        {
          id: "2", 
          time: "2:00 PM",
          title: "Seine River Cruise",
          location: "Port de la Bourdonnais",
          duration: "1.5 hours", 
          cost: 35,
          type: "Relaxation",
          description: "Scenic boat cruise along the Seine with commentary"
        },
        {
          id: "3",
          time: "7:00 PM", 
          title: "Traditional French Dinner",
          location: "Le Marais District",
          duration: "2 hours",
          cost: 85,
          type: "Food",
          description: "Authentic French cuisine at a local bistro"
        }
      ]
    },
    {
      day: 2,
      date: "Sept 16, 2024", 
      totalCost: 320,
      activities: [
        {
          id: "4",
          time: "10:00 AM",
          title: "Louvre Museum",
          location: "Rue de Rivoli, Paris",
          duration: "3 hours",
          cost: 45,
          type: "Culture", 
          description: "World's largest art museum featuring the Mona Lisa"
        },
        {
          id: "5",
          time: "3:00 PM",
          title: "Montmartre Walking Tour", 
          location: "Montmartre, Paris",
          duration: "2 hours",
          cost: 25,
          type: "Adventure",
          description: "Explore the artistic district of Montmartre and Sacré-Cœur"
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl">
      <ItineraryDisplay
        destination="Paris, France"
        days={mockDays}
        totalBudget={1250}
        onBookNow={() => console.log('Booking initiated')}
        onModifyItinerary={() => console.log('Modifying itinerary')}
      />
    </div>
  );
}