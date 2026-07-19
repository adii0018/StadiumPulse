/**
 * @fileoverview Unit tests for CrowdIntelligenceAgent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GateDensitySnapshot } from '../../src/types';

const mockCreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify({
          alerts: [
            {
              gateId: 'G3',
              gateName: 'Gate 3 — East Fan Zone',
              severity: 'critical',
              currentOccupancy: 94,
              predictedPeakOccupancy: 99,
              predictedPeakTimeMinutes: 3,
              message: 'CRITICAL: Gate 3 at 94% capacity.',
            },
          ],
          overallStadiumLoad: 65,
          hotspots: ['G3'],
          recommendation: 'Divert fans from Gate 3 to Gate 4 immediately.',
        }),
      },
    },
  ],
});

vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

vi.mock('../../src/services/cache.service', () => ({
  cacheService: {
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    normalizeKey: vi.fn((k: string) => k),
  },
}));

const { runCrowdIntelligenceAgent } = await import('../../src/agents/crowdIntelligenceAgent');

const makeSnapshot = (gateId: string, occupancy: number, trend = 'stable'): GateDensitySnapshot => ({
  gateId,
  gateName: `Gate ${gateId}`,
  currentOccupancy: occupancy,
  capacity: 3000,
  trend: trend as 'rising' | 'falling' | 'stable',
  timestamp: Date.now(),
});

describe('CrowdIntelligenceAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              alerts: [
                {
                  gateId: 'G3',
                  gateName: 'Gate 3',
                  severity: 'critical',
                  currentOccupancy: 94,
                  predictedPeakOccupancy: 99,
                  predictedPeakTimeMinutes: 3,
                  message: 'CRITICAL: Gate 3 at 94%.',
                },
              ],
              overallStadiumLoad: 65,
              hotspots: ['G3'],
              recommendation: 'Divert fans from Gate 3 to Gate 4.',
            }),
          },
        },
      ],
    });
  });

  it('returns no alerts when all gates are below 80%', async () => {
    const snapshots = [
      makeSnapshot('G1', 45),
      makeSnapshot('G2', 30),
      makeSnapshot('G3', 70),
    ];
    const result = await runCrowdIntelligenceAgent({ snapshots });
    expect(result.agentName).toBe('CrowdIntelligenceAgent');
    expect(result.alerts).toHaveLength(0);
    expect(result.hotspots).toHaveLength(0);
    // LLM should NOT be called
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('generates CRITICAL alert when gate reaches 94%', async () => {
    const snapshots = [makeSnapshot('G1', 50), makeSnapshot('G3', 94, 'rising')];
    const result = await runCrowdIntelligenceAgent({ snapshots });
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].severity).toBe('critical');
    expect(result.alerts[0].gateId).toBe('G3');
    expect(result.alerts[0].currentOccupancy).toBe(94);
  });

  it('identifies hotspot gates correctly', async () => {
    const snapshots = [makeSnapshot('G3', 92, 'rising')];
    const result = await runCrowdIntelligenceAgent({ snapshots });
    expect(result.hotspots).toContain('G3');
  });

  it('provides an actionable recommendation', async () => {
    const snapshots = [makeSnapshot('G3', 93, 'rising')];
    const result = await runCrowdIntelligenceAgent({ snapshots });
    expect(result.recommendation).toBeTruthy();
    expect(result.recommendation.length).toBeGreaterThan(10);
  });

  it('handles malformed LLM output with fallback', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'NOT JSON' } }],
    });
    const snapshots = [makeSnapshot('G6', 95, 'rising')];
    const result = await runCrowdIntelligenceAgent({ snapshots });
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts[0].severity).toBe('critical');
  });
});
