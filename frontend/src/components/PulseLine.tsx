/**
 * @fileoverview PulseLine — ECG-style animated crowd-density vital line.
 * Supports "full" width header strip and compact "badge" sizes.
 */

import { useEffect, useState } from 'react';

interface PulseLineProps {
  size?: 'full' | 'badge';
  status?: 'calm' | 'busy' | 'congested';
}

const STATUS_CONFIG = {
  calm: {
    color: '#1F6E43', // pitch green
    text: 'Calm',
  },
  busy: {
    color: '#E8A33D', // signal-amber
    text: 'Busy',
  },
  congested: {
    color: '#C23B3B', // away-red
    text: 'Congested',
  },
};

export function PulseLine({ size = 'full', status = 'calm' }: PulseLineProps) {
  const config = STATUS_CONFIG[status];
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (size === 'badge') {
    return (
      <div
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold border"
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}30`,
          color: config.color,
        }}
        role="status"
        aria-label={`Stadium status: ${config.text}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${reducedMotion ? '' : 'animate-pulse'}`}
          style={{ backgroundColor: config.color }}
        />
        <span className="uppercase tracking-wider text-[10px] font-mono font-bold">
          {config.text}
        </span>
        <svg className="w-10 h-4" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 8h12l3-6 4 12 3-8 2 2h16"
            stroke={config.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              reducedMotion
                ? {}
                : {
                    strokeDasharray: '60',
                    strokeDashoffset: '60',
                    animation: 'drawBadge 2.5s ease-in-out infinite alternate',
                  }
            }
          />
        </svg>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes drawBadge {
            to {
              strokeDashoffset: 0;
            }
          }
        `}} />
      </div>
    );
  }

  return (
    <div
      className="w-full relative overflow-hidden h-8 flex items-center border-y"
      style={{
        backgroundColor: `${config.color}05`,
        borderColor: `${config.color}15`,
      }}
      role="presentation"
    >
      <div className="absolute inset-y-0 left-4 flex items-center gap-2 z-10 pointer-events-none">
        <span
          className="text-[9px] font-bold font-mono tracking-widest uppercase py-0.5 px-1.5 rounded"
          style={{
            backgroundColor: `${config.color}20`,
            color: config.color,
            border: `1px solid ${config.color}40`,
          }}
        >
          Stadium Pulse Vitals
        </span>
      </div>

      <svg
        className="w-full h-full opacity-60"
        viewBox="0 0 1200 32"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 16h300l5-12 5 24 6-18 4 6h150l5-12 5 24 6-18 4 6h250l5-12 5 24 6-18 4 6h200l5-12 5 24 6-18 4 6h200"
          stroke={config.color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            reducedMotion
              ? {}
              : {
                  strokeDasharray: '2400',
                  animation: 'pulseShift 25s linear infinite',
                }
          }
        />
      </svg>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseShift {
          0% {
            strokeDashoffset: 2400;
          }
          100% {
            strokeDashoffset: 0;
          }
        }
      `}} />
    </div>
  );
}
