import { WeatherSuggestion } from '../WeatherSuggestion';

export default function WeatherSuggestionExample() {
  return (
    <div className="p-6 max-w-md">
      <WeatherSuggestion 
        destination="Paris, France" 
        onDateSelect={(date) => console.log('Selected dates:', date)} 
      />
    </div>
  );
}