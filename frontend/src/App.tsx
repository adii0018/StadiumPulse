/**
 * @fileoverview App root — router setup and global layout.
 * Fix #1: Language state lifted to LanguageProvider context — single source of truth.
 * Fix: Suspense removed (pages not lazy-loaded). 404 uses <Link>.
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Navbar } from './components/Navbar';
import LandingPage from './pages/Landing';
import FanCompanion from './pages/FanCompanion';
import OpsDashboard from './pages/OpsDashboard';
import { LanguageProvider } from './context/LanguageContext';
import './i18n';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/fan" element={<FanCompanion />} />
            <Route path="/ops" element={<OpsDashboard />} />
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center pt-16 bg-concourse text-floodlight">
                  <div className="text-center">
                    <Trophy
                      size={64}
                      className="mx-auto mb-4 text-pitch animate-trophy-float"
                      aria-hidden="true"
                    />
                    <h1 className="stadium-title text-3xl mb-2">Page Not Found</h1>
                    <p className="text-concourse-light mb-6 text-sm">
                      The page you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <Link
                      to="/"
                      className="btn-pulse inline-flex items-center gap-2"
                      aria-label="Go to home"
                    >
                      Go Home
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </LanguageProvider>
    </BrowserRouter>
  );
}
