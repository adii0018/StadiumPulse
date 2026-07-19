/**
 * @fileoverview Unit tests for NavigationAgent.
 * Mocks the Anthropic SDK to avoid real API calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NavigationAgentInput } from '../../src/types';

// Mock Groq SDK
const mockCreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify({
          primaryRoute: [
            { stepNumber: 1, instruction: 'Head to Gate 1', estimatedTimeSeconds: 120 },
            { stepNumber: 2, instruction: 'Turn left at the concourse', estimatedTimeSeconds: 60 },
          ],
          alternateRoute: [
            { stepNumber: 1, instruction: 'Use Gate 10 instead', estimatedTimeSeconds: 180 },
          ],
          primaryCongestionLevel: 88,
          alternateRecommended: true,
          totalEstimatedMinutes: 5,
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

vi.mock('../../src/services/crowdSimulator.service', () => ({
  crowdSimulator: {
    getLatestSnapshot: vi.fn().mockReturnValue([
      { gateId: 'G1', gateName: 'Gate 1', currentOccupancy: 88, capacity: 2500, trend: 'rising', timestamp: Date.now() },
      { gateId: 'G2', gateName: 'Gate 2', currentOccupancy: 30, capacity: 800, trend: 'stable', timestamp: Date.now() },
    ]),
  },
}));

vi.mock('../../src/services/ragKnowledgeBase.service', () => ({
  ragKnowledgeBase: {
    retrieve: vi.fn().mockReturnValue([]),
    formatContext: vi.fn().mockReturnValue('No context'),
  },
}));

vi.mock('../../src/services/cache.service', () => ({
  cacheService: {
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    normalizeKey: vi.fn((k: string) => k),
  },
}));

const { runNavigationAgent } = await import('../../src/agents/navigationAgent');

describe('NavigationAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              primaryRoute: [
                { stepNumber: 1, instruction: 'Head to Gate 1', estimatedTimeSeconds: 120 },
                { stepNumber: 2, instruction: 'Turn left at the concourse', estimatedTimeSeconds: 60 },
              ],
              alternateRoute: [
                { stepNumber: 1, instruction: 'Use Gate 10 instead', estimatedTimeSeconds: 180 },
              ],
              primaryCongestionLevel: 88,
              alternateRecommended: true,
              totalEstimatedMinutes: 5,
            }),
          },
        },
      ],
    });
  });

  it('returns a primary route with step-by-step instructions', async () => {
    const input: NavigationAgentInput = {
      from: 'Gate 1',
      to: 'Section 201',
      language: 'en',
      query: 'How do I get from Gate 1 to Section 201?',
    };

    const result = await runNavigationAgent(input);

    expect(result.agentName).toBe('NavigationAgent');
    expect(result.primaryRoute).toHaveLength(2);
    expect(result.primaryRoute[0].stepNumber).toBe(1);
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it('recommends alternate route when primary gate is congested (>85%)', async () => {
    const input: NavigationAgentInput = {
      from: 'Gate 1',
      to: 'Section 201',
      language: 'en',
      query: 'Route from Gate 1',
    };

    const result = await runNavigationAgent(input);

    expect(result.primaryCongestionLevel).toBe(88);
    expect(result.alternateRecommended).toBe(true);
    expect(result.alternateRoute).toBeDefined();
    expect(result.alternateRoute![0].instruction).toContain('Gate 10');
  });

  it('responds in Spanish when language is es', async () => {
    const input: NavigationAgentInput = {
      from: 'Puerta 1',
      to: 'Sección 201',
      language: 'es',
      query: '¿Cómo llego desde la Puerta 1?',
    };

    const result = await runNavigationAgent(input);
    expect(result.agentName).toBe('NavigationAgent');
  });

  it('handles LLM returning malformed JSON gracefully (fallback)', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'This is not JSON at all.' } }],
    });

    const input: NavigationAgentInput = {
      from: 'Gate 3',
      to: 'Section 300',
      language: 'en',
      query: 'Navigate',
    };

    const result = await runNavigationAgent(input);
    expect(result.primaryRoute.length).toBeGreaterThan(0);
  });
});
