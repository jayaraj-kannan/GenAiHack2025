import { DestinationSearch } from '../DestinationSearch';

export default function DestinationSearchExample() {
  return (
    <div className="p-6 max-w-md">
      <DestinationSearch onDestinationSelect={(destination) => console.log('Selected:', destination)} />
    </div>
  );
}