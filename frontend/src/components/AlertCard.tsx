/**
 * @fileoverview AlertCard — displays a single crowd alert with severity styling.
 * Uses left-border accent coloring, high-contrast typography, and accessible text + icon status indicators.
 */

import { AlertTriangle, Clock, Siren, Info, BarChart2 } from 'lucide-react';
import type { CrowdAlert } from '../types';

interface AlertCardProps {
  alert: CrowdAlert;
}

const SEVERITY_CONFIG = {
  critical: {
    bg: 'rgba(194, 95, 95, 0.08)',
    border: 'rgba(194, 95, 95, 0.25)',
    leftBorderColor: '#C23B3B', // away-red
    icon: <Siren size={16} color="#C23B3B" aria-hidden="true" />,
  },
  high: {
    bg: 'rgba(232, 163, 61, 0.08)',
    border: 'rgba(232, 163, 61, 0.25)',
    leftBorderColor: '#E8A33D', // signal-amber
    icon: <AlertTriangle size={16} color="#E8A33D" aria-hidden="true" />,
  },
  medium: {
    bg: 'rgba(232, 163, 61, 0.06)',
    border: 'rgba(232, 163, 61, 0.20)',
    leftBorderColor: '#E8A33D', // signal-amber
    icon: <BarChart2 size={16} color="#E8A33D" aria-hidden="true" />,
  },
  low: {
    bg: 'rgba(59, 126, 194, 0.08)',
    border: 'rgba(59, 126, 194, 0.25)',
    leftBorderColor: '#3B7EC2', // assist-blue
    icon: <Info size={16} color="#3B7EC2" aria-hidden="true" />,
  },
};

const getSeverityColor = (s: string) => {
  if (s === 'critical') return '#C23B3B';
  if (s === 'high' || s === 'medium') return '#E8A33D';
  return '#3B7EC2';
};

export function AlertCard({ alert }: AlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
  const color = getSeverityColor(alert.severity);

  return (
    <article
      className="p-4 rounded-r-xl border-y border-r animate-slide-up flex flex-col justify-between"
      style={{
        background: config.bg,
        borderColor: config.border,
        borderLeft: `4px solid ${config.leftBorderColor}`,
      }}
      aria-label={`${alert.severity} alert for ${alert.gateName}`}
      role="alert"
      aria-live={alert.severity === 'critical' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="flex-shrink-0 mt-0.5">{config.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase"
                style={{
                  backgroundColor: `${config.leftBorderColor}20`,
                  color: config.leftBorderColor,
                  border: `1px solid ${config.leftBorderColor}30`,
                }}
                aria-label={`Severity: ${alert.severity}`}
              >
                {alert.severity}
              </span>
              <span className="text-white text-xs font-bold font-mono tracking-tight truncate">
                {alert.gateName}
              </span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed font-sans">{alert.message}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold font-display" style={{ color }}>
            {alert.currentOccupancy}%
          </div>
          <div className="text-white/40 text-[9px] uppercase tracking-wider font-mono font-bold">
            capacity
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4">
        <div className="flex items-center gap-1 text-[10px] font-mono text-white/50">
          <AlertTriangle size={10} className="text-white/40" aria-hidden="true" />
          <span>Peak: {alert.predictedPeakOccupancy}%</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-white/50">
          <Clock size={10} className="text-white/40" aria-hidden="true" />
          <span>~{alert.predictedPeakTimeMinutes}m</span>
        </div>
        
        {/* Visual Progress Bar */}
        <div
          className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden ml-auto"
          role="progressbar"
          aria-valuenow={alert.currentOccupancy}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${alert.gateName} at ${alert.currentOccupancy}% capacity`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${alert.currentOccupancy}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </article>
  );
}
