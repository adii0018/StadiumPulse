/**
 * @fileoverview CrowdChart — real-time Recharts area chart for 12 gate densities.
 */

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { GateDensitySnapshot } from '../types';
import { GateHeatCell } from './GateHeatCell';

interface CrowdChartProps {
  snapshots: GateDensitySnapshot[];
}



const getSeverityColor = (occ: number): string => {
  if (occ >= 92) return '#C23B3B'; // away-red
  if (occ >= 70) return '#E8A33D'; // signal-amber
  return '#3B7EC2'; // assist-blue
};

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  payload?: { fullName?: string; [key: string]: any };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const color = getSeverityColor(val as number);
  return (
    <div
      className="p-3 rounded-xl text-xs shadow-xl"
      style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
      role="tooltip"
    >
      <div className="flex items-center gap-4 justify-between min-w-[120px]">
        <span className="text-white/80 font-semibold">{payload[0].payload?.fullName || label}</span>
        <span className="font-bold" style={{ color }}>{val}%</span>
      </div>
    </div>
  );
}

export function CrowdChart({ snapshots }: CrowdChartProps) {
  if (!snapshots.length) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-64" aria-live="polite">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="sp-spinner" aria-hidden="true" />
          <p className="text-floodlight/50 text-sm font-medium">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  // Chart data: formatted as a list of gates for a BarChart
  const chartData = snapshots.map((s) => ({
    name: s.gateName.replace('Gate ', 'G').slice(0, 4),
    fullName: s.gateName,
    value: s.currentOccupancy,
  }));

  return (
    <section aria-label="Live crowd density chart" className="w-full">
      {/* Bar-style overview using recharts */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <ReferenceLine y={80} stroke="#FF6D00" strokeDasharray="4 4" label={{ value: 'Warning 80%', fill: '#FF6D00', fontSize: 10, position: 'insideTopLeft' }} />
          <ReferenceLine y={92} stroke="#CC0001" strokeDasharray="4 4" label={{ value: 'Critical 92%', fill: '#CC0001', fontSize: 10, position: 'insideTopLeft' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getSeverityColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Gate grid overview */}
      <div
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-4"
        role="list"
        aria-label="Gate occupancy summary"
      >
        {snapshots.map((s) => (
          <GateHeatCell key={s.gateId} snapshot={s} />
        ))}
      </div>
    </section>
  );
}
