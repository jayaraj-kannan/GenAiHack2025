import { DestinationCard } from '../DestinationCard';
import cultureImage from "@assets/generated_images/Cultural_heritage_destination_card_7c712f33.png";
import adventureImage from "@assets/generated_images/Adventure_travel_destination_card_8cbc5aee.png";
import relaxImage from "@assets/generated_images/Relaxation_spa_destination_card_c8d484c2.png";

export default function DestinationCardExample() {
  const destinations = [
    {
      id: "1",
      name: "Cultural Heritage Tour",
      image: cultureImage,
      description: "Explore ancient temples and traditional architecture with local guides",
      rating: 4.8,
      duration: "5 days",
      price: 850,
      mood: "Culture"
    },
    {
      id: "2", 
      name: "Mountain Adventure",
      image: adventureImage,
      description: "Thrilling trekking and outdoor activities in stunning landscapes",
      rating: 4.9,
      duration: "7 days", 
      price: 1200,
      mood: "Adventure"
    },
    {
      id: "3",
      name: "Wellness Retreat",
      image: relaxImage, 
      description: "Peaceful spa treatments and meditation in serene natural settings",
      rating: 4.7,
      duration: "4 days",
      price: 950,
      mood: "Relax"
    }
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
      {destinations.map(dest => (
        <DestinationCard
          key={dest.id}
          {...dest}
          onClick={(id) => console.log('Destination clicked:', id)}
        />
      ))}
    </div>
  );
}