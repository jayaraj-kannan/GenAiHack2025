import { MoodSelector } from '../MoodSelector';
import { useState } from 'react';

export default function MoodSelectorExample() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['relax']);

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  return (
    <div className="p-6 max-w-2xl">
      <MoodSelector selectedMoods={selectedMoods} onMoodToggle={handleMoodToggle} />
    </div>
  );
}