import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Preloader } from '../components/Landing/Preloader';
import { HeroSection } from '../components/Landing/HeroSection';
import { FixturesSection } from '../components/Landing/FixturesSection';
import { HostCitiesSection } from '../components/Landing/HostCitiesSection';
import { TeamsSection } from '../components/Landing/TeamsSection';
import { StatsSection } from '../components/Landing/StatsSection';
import { Footer } from '../components/Landing/Footer';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load for the animated preloader
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Ensure window scroll is enabled after loading, in case preloader locked it
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [loading]);

  return (
    <div className="bg-concourse text-floodlight min-h-screen font-body eco-grid">
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      <main className="w-full relative overflow-hidden">
        <HeroSection />
        <FixturesSection />
        <HostCitiesSection />
        <TeamsSection />
        <StatsSection />
        <Footer />
      </main>
    </div>
  );
}
