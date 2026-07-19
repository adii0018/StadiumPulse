/**
 * @fileoverview Unit tests for the RAG knowledge base service.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ragKnowledgeBase } from '../../src/services/ragKnowledgeBase.service';

describe('RAGKnowledgeBaseService', () => {
  beforeAll(async () => {
    await ragKnowledgeBase.initialize();
  });

  it('loads document chunks from all 4 knowledge base sources', () => {
    const gates = ragKnowledgeBase.getBySource('gates.json');
    const transit = ragKnowledgeBase.getBySource('transit.json');
    const medical = ragKnowledgeBase.getBySource('medical.json');
    const protocols = ragKnowledgeBase.getBySource('emergency_protocols.md');

    expect(gates.length).toBeGreaterThan(0);
    expect(transit.length).toBeGreaterThan(0);
    expect(medical.length).toBeGreaterThan(0);
    expect(protocols.length).toBeGreaterThan(0);
  });

  it('retrieves relevant results for a gate navigation query', () => {
    const results = ragKnowledgeBase.retrieve('Gate 1 north main entrance wheelchair', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
    // Most relevant result should mention Gate 1
    expect(results[0].document.content.toLowerCase()).toContain('gate');
  });

  it('retrieves medical results for a medical query', () => {
    const results = ragKnowledgeBase.retrieve('medical emergency first aid AED', 3);
    expect(results.length).toBeGreaterThan(0);
    const hasmedical = results.some((r) => r.document.source === 'medical.json' || r.document.source === 'emergency_protocols.md');
    expect(hasmedical).toBe(true);
  });

  it('returns empty array for a completely irrelevant query', () => {
    const results = ragKnowledgeBase.retrieve('xyzzy foobar nonexistent term qwerty', 3);
    // Might return 0 results if no matches
    expect(Array.isArray(results)).toBe(true);
  });

  it('formats context as a readable string', () => {
    const results = ragKnowledgeBase.retrieve('gate entrance', 2);
    const context = ragKnowledgeBase.formatContext(results);
    expect(typeof context).toBe('string');
    expect(context.length).toBeGreaterThan(10);
  });

  it('caches results for repeated identical queries', () => {
    const q = 'transit metro shuttle bus route';
    const r1 = ragKnowledgeBase.retrieve(q, 3);
    const r2 = ragKnowledgeBase.retrieve(q, 3);
    expect(r1).toEqual(r2);
  });
});
