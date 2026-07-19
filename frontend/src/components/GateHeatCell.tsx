/**
 * @fileoverview GateHeatCell — displays high-density crowd metrics for a single gate.
 * Tailored for the dense, mission-critical NOC grid layout.
 */

import { GateDensitySnapshot } from '../types';

interface GateHeatCellProps {
  snapshot: GateDensitySnapshot;
}

const getHeatColor = (occ: number): string => {
  if (occ >= 92) return '#C23B3B'; // away-red
  if (occ >= 70) return '#E8A33D'; // signal-amber
  return '#3B7EC2'; // assist-blue
};

export function GateHeatCell({ snapshot }: GateHeatCellProps) {
  const color = getHeatColor(snapshot.currentOccupancy);

  return (
    <div
      className="glass-card p-3 flex flex-col justify-between border-t-2"
      style={{ borderTopColor: color }}
      role="listitem"
      aria-label={`${snapshot.gateName}: ${snapshot.currentOccupancy}% capacity, trend ${snapshot.trend}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-bold font-mono text-white/40 tracking-wider uppercase truncate">
          {snapshot.gateId}
        </span>
        <span
          className="text-xs font-bold"
          style={{
            color:
              snapshot.trend === 'rising'
                ? '#C23B3B'
                : snapshot.trend === 'falling'
                ? '#1F6E43'
                : 'rgba(255, 255, 255, 0.3)',
          }}
          aria-label={`Trend: ${snapshot.trend}`}
        >
          {snapshot.trend === 'rising' ? '▲' : snapshot.trend === 'falling' ? '▼' : '■'}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-xl font-bold font-mono tracking-tight text-white leading-none">
          {snapshot.currentOccupancy}%
        </span>
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
          CAP
        </span>
      </div>

      {/* Compact progress bar */}
      <div
        className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={snapshot.currentOccupancy}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${snapshot.currentOccupancy}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
