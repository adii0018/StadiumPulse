/**
 * @fileoverview RecommendationPanel — ranked AI recommendations for ops staff.
 */

import { useTranslation } from 'react-i18next';
import { Sparkles, Users, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import type { OpsRecommendation } from '../types';

interface RecommendationPanelProps {
  recommendations: OpsRecommendation[];
  summaryText?: string;
  loading?: boolean;
}

const URGENCY_CONFIG: Record<string, { bg: string; color: string }> = {
  critical: { bg: '#C23B3B', color: '#ffffff' },
  high:     { bg: '#E8A33D', color: '#12181b' },
  medium:   { bg: '#3B7EC2', color: '#ffffff' },
  low:      { bg: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' },
};

export function RecommendationPanel({ recommendations, summaryText, loading }: RecommendationPanelProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center gap-3" aria-live="polite" aria-busy="true">
        <div className="sp-spinner-gold" aria-hidden="true" />
        <span className="text-floodlight/60 text-sm font-medium">Generating AI recommendations...</span>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="glass-card p-8 text-center" aria-live="polite">
        <CheckCircle size={36} className="mx-auto mb-3 text-pitch" aria-hidden="true" />
        <p className="text-floodlight/50 text-sm font-medium">{t('ops.noRecs')}</p>
      </div>
    );
  }

  return (
    <section className="glass-card p-5 sm:p-6" aria-label="AI Recommendations">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-signal-amber" aria-hidden="true" />
        <h2 className="font-semibold text-floodlight text-sm sm:text-base">{t('ops.recommendations')}</h2>
        <span
          className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 font-mono"
          style={{ background: 'linear-gradient(135deg, #E8A33D, #F2B963)', color: '#12181b' }}
        >
          {recommendations.length} action{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {summaryText && (
        <div
          className="mb-4 p-3.5 rounded-xl text-sm text-floodlight/70 leading-relaxed"
          style={{ background: 'rgba(232,163,61,0.06)', border: '1px solid rgba(232,163,61,0.18)' }}
        >
          {summaryText}
        </div>
      )}

      <ol className="space-y-3" aria-label="Ranked recommendations list">
        {recommendations.map((rec) => {
          const uc = URGENCY_CONFIG[rec.urgency] ?? URGENCY_CONFIG.low;
          return (
            <li
              key={rec.priority}
              className="p-3.5 sm:p-4 rounded-xl transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              aria-label={`Priority ${rec.priority}: ${rec.action}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: uc.bg, color: uc.color }}
                  aria-label={`Priority ${rec.priority}`}
                >
                  {rec.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-floodlight text-sm font-semibold leading-snug mb-1">{rec.action}</p>
                  <p className="text-floodlight/50 text-xs leading-relaxed">{rec.rationale}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-floodlight/40 font-mono">
                    <span className="flex items-center gap-1">
                      <Users size={10} aria-hidden="true" />
                      {rec.requiredStaff} staff
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} aria-hidden="true" />
                      ~{rec.estimatedReliefMinutes} min
                    </span>
                    {rec.affectedGates.length > 0 && (
                      <span className="flex items-center gap-1">
                        <ChevronRight size={10} aria-hidden="true" />
                        Gates: {rec.affectedGates.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
