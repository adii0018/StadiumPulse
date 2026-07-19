/**
 * @fileoverview OpsDashboard — real-time command center for stadium staff.
 * Tailored for a dense, high-performance NOC grid view using the concourse theme.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  RefreshCw,
  Zap,
  Activity,
  Shield,
  BarChart2,
  Siren,
  AlertTriangle,
  Building2,
  CheckCircle,
  User,
} from 'lucide-react';
import { CrowdChart } from '../components/CrowdChart';
import { AlertCard } from '../components/AlertCard';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { LoginModal } from '../components/LoginModal';
import { PulseLine } from '../components/PulseLine';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { triggerOpsAlert, getOpsRecommendations } from '../services/api';
import type { OpsRecommendation } from '../types';

export default function OpsDashboard() {
  const { t } = useTranslation();
  const { isAuthenticated, user, signIn, signOut, loading: authLoading, error: authError } = useAuth();
  const { snapshots, alerts, connected } = useWebSocket();
  const [recommendations, setRecommendations] = useState<OpsRecommendation[]>([]);
  const [summaryText, setSummaryText] = useState('');
  const [recsLoading, setRecsLoading] = useState(false);
  const [testAlertLoading, setTestAlertLoading] = useState(false);
  // Fix #2: error states for ops actions — no longer silently swallowed
  const [recsError, setRecsError] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const refreshRecommendations = useCallback(async () => {
    setRecsLoading(true);
    setRecsError(null);
    try {
      const result = await getOpsRecommendations();
      setRecommendations(result.recommendations);
      // Clear stale summary when refreshing recommendations
      setSummaryText('');
    } catch {
      setRecsError('Failed to load recommendations. Check connection and try again.');
    } finally {
      setRecsLoading(false);
    }
  }, []);

  const handleTriggerAlert = async () => {
    setTestAlertLoading(true);
    setAlertError(null);
    try {
      const result = await triggerOpsAlert('G7');
      setRecommendations(result.recommendation.recommendations);
      setSummaryText(result.recommendation.summaryForDisplay);
    } catch {
      setAlertError('Failed to trigger alert. Ensure you are connected and try again.');
    } finally {
      setTestAlertLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-concourse pt-14">
        <LoginModal onLogin={signIn} loading={authLoading} error={authError} />
      </div>
    );
  }

  const overallLoad = snapshots.length
    ? Math.round(snapshots.reduce((sum, s) => sum + s.currentOccupancy, 0) / snapshots.length)
    : 0;

  const criticalGates = alerts.filter((a) => a.severity === 'critical').length;
  const highGates = alerts.filter((a) => a.severity === 'high').length;

  const KPI_ITEMS = [
    {
      label: t('ops.overallLoad'),
      value: `${overallLoad}%`,
      color: overallLoad >= 92 ? '#C23B3B' : overallLoad >= 70 ? '#E8A33D' : '#3B7EC2',
      icon: <BarChart2 size={16} aria-hidden="true" />,
    },
    {
      label: 'Critical Gates',
      value: criticalGates,
      color: criticalGates > 0 ? '#C23B3B' : '#1F6E43',
      icon: <Siren size={16} aria-hidden="true" />,
    },
    {
      label: 'High Alert',
      value: highGates,
      color: highGates > 0 ? '#E8A33D' : '#1F6E43',
      icon: <AlertTriangle size={16} aria-hidden="true" />,
    },
    {
      label: 'Gates Live',
      value: snapshots.length,
      color: '#3B7EC2',
      icon: <Building2 size={16} aria-hidden="true" />,
    },
  ];

  return (
    <main className="min-h-screen bg-concourse text-floodlight pt-14 pb-10" aria-label="Operations Command Center">
      {/* Vital Pulse Banner (full-width) */}
      <PulseLine
        size="full"
        status={overallLoad >= 92 ? 'congested' : overallLoad >= 70 ? 'busy' : 'calm'}
      />

      {/* Header */}
      <div className="border-b pt-5 pb-4 px-4 sm:px-6" style={{ borderColor: 'rgba(59, 126, 194, 0.15)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield size={18} className="text-[#3B7EC2]" aria-hidden="true" />
              <h1 className="stadium-title text-2xl text-[#F5F7F4]">{t('ops.title')}</h1>
            </div>
            <p className="text-[10px] tracking-widest uppercase font-bold font-mono text-[#3B7EC2]/70">
              {t('ops.subtitle')}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Connection status */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider"
              style={{
                backgroundColor: connected ? 'rgba(31, 110, 67, 0.08)' : 'rgba(194, 59, 59, 0.08)',
                border: `1px solid ${connected ? 'rgba(31, 110, 67, 0.25)' : 'rgba(194, 59, 59, 0.25)'}`,
                color: connected ? '#1F6E43' : '#C23B3B',
              }}
              role="status"
              aria-label={connected ? 'WebSocket connected' : 'WebSocket reconnecting'}
            >
              <Activity
                size={11}
                className={connected ? 'animate-pulse' : ''}
                aria-hidden="true"
              />
              SYSTEM {connected ? 'ONLINE' : 'OFFLINE'}
            </div>

            {/* User */}
            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <User size={12} className="text-[#3B7EC2]" aria-hidden="true" />
              <span className="max-w-[130px] truncate">{user?.email}</span>
            </div>

            {/* Logout */}
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-wider font-mono"
              aria-label={t('ops.logout')}
            >
              <LogOut size={12} aria-hidden="true" />
              <span className="hidden sm:inline">{t('ops.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* KPI strip */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Key performance indicators"
        >
          {KPI_ITEMS.map((kpi) => (
            <div
              key={kpi.label}
              className="kpi-card flex flex-col justify-between"
              style={{ '--kpi-color': kpi.color } as React.CSSProperties}
              role="listitem"
              aria-label={`${kpi.label}: ${kpi.value}`}
            >
              <div className="flex items-center gap-2 mb-3" style={{ color: kpi.color }}>
                {kpi.icon}
                <span className="text-[10px] text-floodlight/50 font-bold uppercase tracking-wider font-mono">{kpi.label}</span>
              </div>
              <div
                className="text-3xl font-extrabold font-mono tracking-tight"
                style={{ color: kpi.color, textShadow: `0 0 16px ${kpi.color}40` }}
              >
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Live Crowd Chart */}
        <section className="glass-card p-4 sm:p-6 radar-sweep-container" aria-label="Live crowd density monitoring">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#3B7EC2]" aria-hidden="true" />
              <h2 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                {t('ops.crowdDensity')}
              </h2>
            </div>
            <div className="live-indicator font-mono font-bold" aria-label="Radar scan active">
              <div
                className="w-1.5 h-1.5 rounded-full animate-ping flex-shrink-0"
                style={{ backgroundColor: '#3B7EC2' }}
                aria-hidden="true"
              />
              RADAR ACTIVE
            </div>
          </div>
          <div className="relative z-10">
            <CrowdChart snapshots={snapshots} />
          </div>
        </section>

        {/* Alerts + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Active Alerts */}
          <section className="glass-card p-4 sm:p-6" aria-label="Active crowd alerts" aria-live="polite">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-white text-sm sm:text-base uppercase tracking-wider">{t('ops.alerts')}</h2>
              {alerts.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-away-red/20 text-away-red border border-away-red/30"
                  aria-label={`${alerts.length} active alerts`}
                >
                  {alerts.length}
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll" role="list" aria-label="Alert list">
              <AnimatePresence>
                {alerts.length === 0 ? (
                  <motion.div
                    key="no-alerts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10"
                    aria-live="polite"
                  >
                    <CheckCircle
                      size={36}
                      className="mx-auto mb-3 text-[#1F6E43]"
                      aria-hidden="true"
                    />
                    <p className="text-white/40 text-xs font-mono font-bold uppercase tracking-wider">{t('ops.noAlerts')}</p>
                  </motion.div>
                ) : (
                  alerts.map((alert) => (
                    <motion.div
                      key={`${alert.gateId}-${alert.severity}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      role="listitem"
                    >
                      <AlertCard alert={alert} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* AI Recommendations */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => void refreshRecommendations()}
                disabled={recsLoading}
                className="btn-ghost btn-sm flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                aria-label={t('ops.refreshRecs')}
                aria-busy={recsLoading}
              >
                <RefreshCw size={13} className={recsLoading ? 'animate-spin' : ''} aria-hidden="true" />
                {t('ops.refreshRecs')}
              </button>
              <button
                onClick={() => void handleTriggerAlert()}
                disabled={testAlertLoading}
                className="btn-pulse btn-sm flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                aria-label={t('ops.triggerAlert')}
                aria-busy={testAlertLoading}
              >
                <Zap size={13} aria-hidden="true" />
                {testAlertLoading ? 'Processing...' : t('ops.triggerAlert')}
              </button>
            </div>

            {/* Fix #2: ops error feedback */}
            {(recsError || alertError) && (
              <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs"
                style={{ backgroundColor: 'rgba(194,59,59,0.08)', border: '1px solid rgba(194,59,59,0.25)' }}
                role="alert"
              >
                <AlertTriangle size={13} className="text-away-red flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-away-red font-semibold">{recsError ?? alertError}</span>
              </div>
            )}

            <RecommendationPanel
              recommendations={recommendations}
              summaryText={summaryText}
              loading={recsLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
