import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock } from "lucide-react";

interface DestinationCardProps {
  id: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  duration: string;
  price: number;
  mood: string;
  onClick: (id: string) => void;
}

export function DestinationCard({ 
  id, 
  name, 
  image, 
  description, 
  rating, 
  duration, 
  price, 
  mood, 
  onClick 
}: DestinationCardProps) {
  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "culture":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "adventure":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "relax":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <Card className="overflow-hidden hover-elevate cursor-pointer" onClick={() => onClick(id)} data-testid={`destination-card-${id}`}>
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getMoodColor(mood)}>
            {mood}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm font-medium">
          ${price}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Travel destination
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          </div>
          
          <Button size="sm" onClick={(e) => {
            e.stopPropagation();
            onClick(id);
            console.log("Destination selected:", name);
          }}>
            Explore
          </Button>
        </div>
      </div>
    </Card>
  );
}