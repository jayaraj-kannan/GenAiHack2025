import { TripDurationPicker } from '../TripDurationPicker';
import { useState } from 'react';

export default function TripDurationPickerExample() {
  const [duration, setDuration] = useState(7);

  return (
    <div className="p-6 max-w-2xl">
      <TripDurationPicker duration={duration} onDurationChange={setDuration} />
    </div>
  );
}