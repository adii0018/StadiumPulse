/**
 * @fileoverview Crowd density simulator service.
 *
 * Generates realistic, time-varying crowd density data for 12 stadium gates.
 * Simulates: gradual buildup before match, surge events, post-match dispersal.
 * Broadcasts updates via WebSocket at a debounced 1-second interval.
 * Emits threshold alerts (>80% warning, >90% critical) to registered listeners.
 */

import { EventEmitter } from 'events';
import { env } from '../config/env';
import type { GateDensitySnapshot, CrowdAlert, AlertSeverity } from '../types';

/** Registered gates with their base characteristics */
interface GateConfig {
  id: string;
  name: string;
  capacity: number;
  /** Baseline congestion tendency (0–1, higher = more prone to crowding) */
  congestionBias: number;
}

const GATE_CONFIGS: GateConfig[] = [
  { id: 'G1', name: 'Gate 1 — North Main', capacity: 2500, congestionBias: 0.7 },
  { id: 'G2', name: 'Gate 2 — North VIP', capacity: 800, congestionBias: 0.3 },
  { id: 'G3', name: 'Gate 3 — East Fan Zone', capacity: 3000, congestionBias: 0.8 },
  { id: 'G4', name: 'Gate 4 — East Premium', capacity: 1200, congestionBias: 0.4 },
  { id: 'G5', name: 'Gate 5 — South Family', capacity: 2200, congestionBias: 0.6 },
  { id: 'G6', name: 'Gate 6 — South Main', capacity: 3500, congestionBias: 0.75 },
  { id: 'G7', name: 'Gate 7 — South West', capacity: 2000, congestionBias: 0.65 },
  { id: 'G8', name: 'Gate 8 — West Fan Zone', capacity: 2800, congestionBias: 0.72 },
  { id: 'G9', name: 'Gate 9 — West Premium', capacity: 1000, congestionBias: 0.35 },
  { id: 'G10', name: 'Gate 10 — NE Corner', capacity: 1800, congestionBias: 0.5 },
  { id: 'G11', name: 'Gate 11 — NW Corner', capacity: 1800, congestionBias: 0.5 },
  { id: 'G12', name: 'Gate 12 — Staff Only', capacity: 500, congestionBias: 0.2 },
];

/** Thresholds for alert escalation */
const THRESHOLD_WARNING = 80;
const THRESHOLD_CRITICAL = 92;

class CrowdSimulatorService extends EventEmitter {
  private occupancies: Map<string, number> = new Map();
  private surgeTargets: Map<string, number> = new Map();
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;

  constructor() {
    super();
    // Initialize all gates at low occupancy
    GATE_CONFIGS.forEach((g) => {
      this.occupancies.set(g.id, 20 + Math.random() * 20);
    });
  }

  /**
   * Starts the crowd simulation loop.
   * Emits 'snapshot' event every CROWD_UPDATE_INTERVAL_MS with latest data.
   * Emits 'alert' event when a gate crosses a threshold.
   */
  start(): void {
    if (this.intervalHandle) return;

    this.intervalHandle = setInterval(() => {
      this.tick();
    }, env.CROWD_UPDATE_INTERVAL_MS);

    console.log('[CrowdSim] Simulation started');
  }

  /**
   * Stops the simulation and clears the interval.
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    console.log('[CrowdSim] Simulation stopped');
  }

  /**
   * Returns the latest snapshot of all gate densities.
   */
  getLatestSnapshot(): GateDensitySnapshot[] {
    return this.buildSnapshot(this.occupancies);
  }

  /**
   * Injects an artificial surge on a specific gate (for demo / ops testing).
   * @param gateId - Target gate ID
   * @param targetOccupancy - Target occupancy percentage (0–100)
   */
  injectSurge(gateId: string, targetOccupancy: number): void {
    const target = Math.min(100, Math.max(0, targetOccupancy));
    this.surgeTargets.set(gateId, target);
    this.occupancies.set(gateId, target);
    console.log(`[CrowdSim] Surge injected: ${gateId} → ${target}%`);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private tick(): void {
    this.tickCount++;
    const previousOccupancies = new Map(this.occupancies);

    GATE_CONFIGS.forEach((gate) => {
      let current = this.occupancies.get(gate.id) ?? 30;

      // If a surge target is set, move toward it quickly
      const surgeTarget = this.surgeTargets.get(gate.id);
      if (surgeTarget !== undefined) {
        const delta = surgeTarget - current;
        current += delta * 0.15 + (Math.random() - 0.5) * 1;
        if (Math.abs(surgeTarget - current) < 2) {
          this.surgeTargets.delete(gate.id);
        }
      } else {
        // Natural crowd drift based on gate congestion bias
        const drift = this.naturalDrift(gate, current);
        current = Math.min(100, Math.max(0, current + drift));
      }

      this.occupancies.set(gate.id, current);

      // Check threshold crossings
      const prev = previousOccupancies.get(gate.id) ?? 0;
      this.checkThreshold(gate, prev, current);
    });

    // Every 30 ticks (~30s) potentially inject organic surge on a random gate
    if (this.tickCount % 30 === 0) {
      this.maybeInjectOrganicSurge();
    }

    this.emit('snapshot', this.buildSnapshot(previousOccupancies));
  }

  private naturalDrift(gate: GateConfig, current: number): number {
    // Simulate realistic crowd flow with mean-reversion + bias
    const meanTarget = 40 + gate.congestionBias * 40; // natural equilibrium per gate
    const meanReversion = (meanTarget - current) * 0.03;
    const noise = (Math.random() - 0.5) * 3;
    return meanReversion + noise;
  }

  private checkThreshold(gate: GateConfig, prev: number, current: number): void {
    // Only emit alert on threshold crossing (not on every tick above threshold)
    if (prev < THRESHOLD_CRITICAL && current >= THRESHOLD_CRITICAL) {
      const alert: CrowdAlert = {
        gateId: gate.id,
        gateName: gate.name,
        severity: 'critical',
        currentOccupancy: Math.round(current),
        predictedPeakOccupancy: Math.min(100, Math.round(current + 5)),
        predictedPeakTimeMinutes: 3,
        message: `CRITICAL: ${gate.name} has reached ${Math.round(current)}% capacity. Immediate action required.`,
      };
      this.emit('alert', alert);
    } else if (
      prev < THRESHOLD_WARNING &&
      current >= THRESHOLD_WARNING &&
      current < THRESHOLD_CRITICAL
    ) {
      const alert: CrowdAlert = {
        gateId: gate.id,
        gateName: gate.name,
        severity: 'high',
        currentOccupancy: Math.round(current),
        predictedPeakOccupancy: Math.min(100, Math.round(current + 8)),
        predictedPeakTimeMinutes: 6,
        message: `WARNING: ${gate.name} is at ${Math.round(current)}% capacity. Monitor closely.`,
      };
      this.emit('alert', alert);
    } else if (
      prev >= THRESHOLD_WARNING &&
      current < THRESHOLD_WARNING
    ) {
      const alert: CrowdAlert = {
        gateId: gate.id,
        gateName: gate.name,
        severity: 'low',
        currentOccupancy: Math.round(current),
        predictedPeakOccupancy: Math.round(current),
        predictedPeakTimeMinutes: 0,
        message: `CLEAR: ${gate.name} occupancy has returned to normal (${Math.round(current)}%).`,
      };
      this.emit('alert', alert);
    }
  }

  private maybeInjectOrganicSurge(): void {
    // 30% chance of an organic surge on a high-bias gate
    if (Math.random() < 0.3) {
      const highBiasGates = GATE_CONFIGS.filter((g) => g.congestionBias > 0.6);
      const target = highBiasGates[Math.floor(Math.random() * highBiasGates.length)];
      const current = this.occupancies.get(target.id) ?? 40;
      const surge = current + 15 + Math.random() * 20;
      this.surgeTargets.set(target.id, Math.min(100, surge));
    }
  }

  private buildSnapshot(prevOccupancies: Map<string, number>): GateDensitySnapshot[] {
    const now = Date.now();

    return GATE_CONFIGS.map((gate) => {
      const current = Math.round(this.occupancies.get(gate.id) ?? 0);
      const prev = Math.round(prevOccupancies.get(gate.id) ?? current);
      const diff = current - prev;
      const trend: GateDensitySnapshot['trend'] =
        diff > 1 ? 'rising' : diff < -1 ? 'falling' : 'stable';

      return {
        gateId: gate.id,
        gateName: gate.name,
        currentOccupancy: current,
        capacity: gate.capacity,
        trend,
        timestamp: now,
      };
    });
  }

  /**
   * Returns the severity label for a given occupancy percentage.
   */
  static getSeverity(occupancy: number): AlertSeverity {
    if (occupancy >= THRESHOLD_CRITICAL) return 'critical';
    if (occupancy >= THRESHOLD_WARNING) return 'high';
    if (occupancy >= 70) return 'medium';
    return 'low';
  }
}

/** Singleton crowd simulator instance */
export const crowdSimulator = new CrowdSimulatorService();
