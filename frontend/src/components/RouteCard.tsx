/**
 * @fileoverview RouteCard — displays steps, mini-map mockup, and alternate route warnings.
 * Designed for light theme (Fan Companion).
 */

import { Navigation2, LocateFixed, AlertTriangle } from 'lucide-react';
import type { NavigationStep } from '../types';

interface RouteCardProps {
  navigation: {
    alternateRecommended: boolean;
    primaryCongestionLevel: number;
    totalEstimatedMinutes: number;
    primaryRoute: NavigationStep[];
    alternateRoute?: NavigationStep[];
  };
  from: string;
  to: string;
}

export function RouteCard({ navigation, from, to }: RouteCardProps) {
  const steps = navigation.alternateRecommended
    ? navigation.alternateRoute || []
    : navigation.primaryRoute;

  return (
    <div className="glass-card-light p-5 border-l-4 border-pitch">
      {/* Alternate Route Alert Banner */}
      {navigation.alternateRecommended && (
        <div
          className="mb-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5"
          style={{ backgroundColor: '#E8A33D15', border: '1px solid #E8A33D40' }}
          role="alert"
        >
          <AlertTriangle size={15} className="text-signal-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-concourse" style={{ color: '#B87B1D' }}>
              Primary Route Congested ({navigation.primaryCongestionLevel}% occupancy)
            </p>
            <p className="text-concourse/60 mt-0.5">
              Alternate route automatically selected to bypass heavy foot traffic.
            </p>
          </div>
        </div>
      )}

      {/* Origin/Destination Header */}
      <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(31, 110, 67, 0.1)' }}>
        <div>
          <span className="text-[9px] uppercase tracking-widest text-concourse/40 font-bold block">
            Navigation Route
          </span>
          <span className="text-sm font-extrabold text-concourse flex items-center gap-1.5 mt-0.5">
            {from} <Navigation2 size={10} className="rotate-90 text-pitch" /> {to}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-display text-pitch block">
            ~{navigation.totalEstimatedMinutes}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-concourse/50 font-bold">
            minutes
          </span>
        </div>
      </div>

      {/* Mockup Mini-map */}
      <div
        className="h-28 w-full rounded-xl mb-4 relative overflow-hidden flex items-center justify-center border"
        style={{
          backgroundColor: '#E1E6E0',
          borderColor: 'rgba(31, 110, 67, 0.15)',
        }}
        aria-hidden="true"
      >
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle, #1F6E43 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }} />

        {/* Decorative Stadium Outline */}
        <div className="absolute w-24 h-16 rounded-full border-2 border-pitch/30 flex items-center justify-center bg-[#F5F7F4]/60">
          <span className="text-[8px] font-bold font-mono text-pitch/50 uppercase">stadium pitch</span>
        </div>

        {/* Animated Wayfinding Route Line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 112" fill="none">
          <path
            d="M 40,80 Q 120,40 180,60 T 260,20"
            stroke="#1F6E43"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-route-flow"
          />
          {/* Start and End nodes */}
          <circle cx="40" cy="80" r="5" fill="#3B7EC2" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="260" cy="20" r="5" fill="#C23B3B" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>

        <span className="absolute bottom-2 right-2 text-[8px] font-mono font-bold bg-[#12181B]/80 text-[#F5F7F4] px-1.5 py-0.5 rounded">
          LIVE MAP PREVIEW
        </span>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes routeFlow {
            to {
              strokeDashoffset: -28;
            }
          }
          .animate-route-flow {
            animation: routeFlow 3s linear infinite;
          }
        `}} />
      </div>

      {/* Step Checklist */}
      <ol className="space-y-3" aria-label="Navigation steps">
        {steps.map((step) => (
          <li key={step.stepNumber} className="flex gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-floodlight"
              style={{ backgroundColor: '#1F6E43' }}
              aria-hidden="true"
            >
              {step.stepNumber}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-concourse leading-tight">
                {step.instruction}
              </p>
              {step.landmark && (
                <span className="text-[10px] text-concourse/50 flex items-center gap-1 mt-1">
                  <LocateFixed size={10} className="text-pitch" aria-hidden="true" />
                  Landmark: {step.landmark}
                </span>
              )}
              <span className="text-[9px] font-mono text-pitch/70 block mt-0.5">
                ~{Math.round(step.estimatedTimeSeconds / 60)} min
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
