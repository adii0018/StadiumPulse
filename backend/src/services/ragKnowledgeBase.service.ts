/**
 * @fileoverview In-memory RAG knowledge base service.
 *
 * Implements TF-IDF style keyword retrieval over 4 knowledge base sources:
 * gates.json, transit.json, medical.json, and emergency_protocols.md.
 *
 * Production upgrade path: Replace with Chroma (chromadb npm client) or
 * Pinecone. The retrieve() interface is identical — only the implementation changes.
 * Tradeoff: keyword retrieval has lower recall than semantic embedding search,
 * but is zero-dependency, zero-latency at startup, and sufficient for a well-
 * structured factual knowledge base like stadium operations data.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { KnowledgeBaseDocument, RAGResult } from '../types';
import { cacheService } from './cache.service';

const DATA_DIR = join(__dirname, '..', 'data');

/** Chunk size for splitting large documents into retrievable pieces */
const CHUNK_SIZE = 500;

class RAGKnowledgeBaseService {
  private documents: KnowledgeBaseDocument[] = [];
  private initialized = false;

  /**
   * Initializes the knowledge base by loading all source files.
   * Called once at server startup. Subsequent calls are no-ops.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const gatesRaw = readFileSync(join(DATA_DIR, 'gates.json'), 'utf-8');
    const transitRaw = readFileSync(join(DATA_DIR, 'transit.json'), 'utf-8');
    const medicalRaw = readFileSync(join(DATA_DIR, 'medical.json'), 'utf-8');
    const protocolsRaw = readFileSync(join(DATA_DIR, 'emergency_protocols.md'), 'utf-8');

    // Process JSON arrays — each item becomes a document chunk
    const gates = JSON.parse(gatesRaw) as object[];
    const transit = JSON.parse(transitRaw) as object[];
    const medical = JSON.parse(medicalRaw) as object[];

    gates.forEach((gate, i) => {
      const text = JSON.stringify(gate);
      this.documents.push({
        id: `gates_${i}`,
        source: 'gates.json',
        content: text,
        keywords: this.extractKeywords(text),
      });
    });

    transit.forEach((route, i) => {
      const text = JSON.stringify(route);
      this.documents.push({
        id: `transit_${i}`,
        source: 'transit.json',
        content: text,
        keywords: this.extractKeywords(text),
      });
    });

    medical.forEach((post, i) => {
      const text = JSON.stringify(post);
      this.documents.push({
        id: `medical_${i}`,
        source: 'medical.json',
        content: text,
        keywords: this.extractKeywords(text),
      });
    });

    // Split markdown into chunks
    const chunks = this.chunkText(protocolsRaw, CHUNK_SIZE);
    chunks.forEach((chunk, i) => {
      this.documents.push({
        id: `protocols_${i}`,
        source: 'emergency_protocols.md',
        content: chunk,
        keywords: this.extractKeywords(chunk),
      });
    });

    this.initialized = true;
    console.log(`[RAG] Loaded ${this.documents.length} document chunks into knowledge base`);
  }

  /**
   * Retrieves the most relevant document chunks for a given query.
   * Results are cached by normalized query + topK.
   *
   * @param query - Natural language query from user or agent
   * @param topK - Maximum number of results to return (default: 5)
   * @returns Ranked list of document chunks with relevance scores
   */
  retrieve(query: string, topK = 5): RAGResult[] {
    const cacheKey = cacheService.normalizeKey(`rag:${query}:${topK}`);
    const cached = cacheService.get<RAGResult[]>(cacheKey);
    if (cached) return cached;

    const queryKeywords = this.extractKeywords(query);
    const scores: Array<{ doc: KnowledgeBaseDocument; score: number }> = [];

    for (const doc of this.documents) {
      const score = this.computeTFIDFScore(queryKeywords, doc.keywords);
      if (score > 0) {
        scores.push({ doc, score });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    const results: RAGResult[] = scores.slice(0, topK).map((s) => ({
      document: s.doc,
      score: s.score,
    }));

    cacheService.set(cacheKey, results);
    return results;
  }

  /**
   * Returns all documents for a specific source file.
   * Used by agents that need complete context (e.g., all gates).
   */
  getBySource(source: string): KnowledgeBaseDocument[] {
    return this.documents.filter((d) => d.source === source);
  }

  /**
   * Formats retrieved results into a single context string for LLM injection.
   * @param results - RAG results from retrieve()
   * @returns Formatted context block ready to inject into a system/user prompt
   */
  formatContext(results: RAGResult[]): string {
    if (results.length === 0) return 'No relevant context found in knowledge base.';

    return results
      .map(
        (r, i) =>
          `[Source ${i + 1}: ${r.document.source} | Relevance: ${r.score.toFixed(2)}]\n${r.document.content}`,
      )
      .join('\n\n---\n\n');
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Extracts meaningful keywords from text (stop-word filtered).
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
      'on', 'with', 'at', 'by', 'from', 'and', 'or', 'but', 'if', 'it',
      'its', 'this', 'that', 'not', 'no', 'so', 'as', 'up', 'out', 'than',
      'into', 'also', 'all', 'any', 'each', 'most', 'other', 'some', 'such',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }

  /**
   * Computes a TF-IDF inspired score between query keywords and document keywords.
   * Score = number of overlapping unique terms / sqrt(doc keyword count)
   */
  private computeTFIDFScore(queryKws: string[], docKws: string[]): number {
    const docSet = new Set(docKws);
    const matches = queryKws.filter((kw) => docSet.has(kw)).length;
    if (matches === 0) return 0;
    return matches / Math.sqrt(docKws.length + 1);
  }

  /**
   * Splits a large text into overlapping chunks of approximately chunkSize characters.
   */
  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n{2,}/);
    let current = '';

    for (const para of paragraphs) {
      if ((current + para).length > chunkSize && current.length > 0) {
        chunks.push(current.trim());
        current = para;
      } else {
        current += (current ? '\n\n' : '') + para;
      }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }
}

/** Singleton RAG service instance */
export const ragKnowledgeBase = new RAGKnowledgeBaseService();
