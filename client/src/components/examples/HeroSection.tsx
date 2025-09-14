import { HeroSection } from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <HeroSection onGetStarted={(destination) => console.log('Getting started with:', destination)} />
  );
}