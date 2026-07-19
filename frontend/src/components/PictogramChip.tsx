/**
 * @fileoverview PictogramChip — quick action chips for mobile wayfinding shortcuts.
 * Meets WCAG touch target size guidelines (min 44px height/width).
 */

import { ReactNode } from 'react';

interface PictogramChipProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  active?: boolean;
}

export function PictogramChip({
  label,
  icon,
  onClick,
  ariaLabel,
  active = false,
}: PictogramChipProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl text-xs font-bold transition-all duration-150 border"
      style={
        active
          ? {
              backgroundColor: '#1F6E43', // pitch green
              color: '#F5F7F4', // floodlight
              borderColor: '#1F6E43',
              boxShadow: '0 4px 12px rgba(31, 110, 67, 0.25)',
            }
          : {
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              color: '#12181B', // concourse
              borderColor: 'rgba(31, 110, 67, 0.15)',
            }
      }
      aria-pressed={active}
      aria-label={ariaLabel || label}
    >
      <span className="flex-shrink-0" aria-hidden="true" style={{ color: active ? '#F5F7F4' : '#1F6E43' }}>
        {icon}
      </span>
      <span className="uppercase tracking-wider text-[10px] font-bold">
        {label}
      </span>
    </button>
  );
}
