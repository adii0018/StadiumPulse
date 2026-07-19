/**
 * @fileoverview Shared TypeScript types and interfaces for StadiumPulse backend.
 * All API request/response shapes and agent I/O are defined here — no `any` allowed.
 */

// =============================================================================
// Agent Types
// =============================================================================

/** Severity levels for operational alerts */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Languages supported for multilingual responses */
export type SupportedLanguage = 'en' | 'es' | 'hi';

/** Base input shared across all agents */
export interface AgentBaseInput {
  /** User's preferred language for the response */
  language: SupportedLanguage;
  /** Sanitized, length-capped user query */
  query: string;
  /** Optional request ID for tracing */
  requestId?: string;
}

/** Base output shared across all agents */
export interface AgentBaseOutput {
  /** Agent name that produced this output */
  agentName: string;
  /** Unix timestamp of when the response was generated */
  timestamp: number;
  /** Whether the response was served from cache */
  fromCache: boolean;
}

// --- NavigationAgent ---

export interface NavigationAgentInput extends AgentBaseInput {
  /** Origin location (gate ID or named area) */
  from: string;
  /** Destination (gate ID, section, or named area) */
  to: string;
  /** Whether to prefer wheelchair-accessible routes */
  accessibilityRequired?: boolean;
}

export interface NavigationStep {
  stepNumber: number;
  instruction: string;
  landmark?: string;
  estimatedTimeSeconds: number;
}

export interface NavigationAgentOutput extends AgentBaseOutput {
  agentName: 'NavigationAgent';
  primaryRoute: NavigationStep[];
  alternateRoute?: NavigationStep[];
  primaryCongestionLevel: number; // 0–100
  alternateRecommended: boolean;
  totalEstimatedMinutes: number;
}

// --- CrowdIntelligenceAgent ---

export interface GateDensitySnapshot {
  gateId: string;
  gateName: string;
  currentOccupancy: number; // 0–100 percentage
  capacity: number;
  trend: 'rising' | 'falling' | 'stable';
  timestamp: number;
}

export interface CrowdIntelligenceAgentInput {
  snapshots: GateDensitySnapshot[];
  requestId?: string;
}

export interface CrowdAlert {
  gateId: string;
  gateName: string;
  severity: AlertSeverity;
  currentOccupancy: number;
  predictedPeakOccupancy: number;
  predictedPeakTimeMinutes: number;
  message: string;
}

export interface CrowdIntelligenceAgentOutput extends AgentBaseOutput {
  agentName: 'CrowdIntelligenceAgent';
  alerts: CrowdAlert[];
  overallStadiumLoad: number; // 0–100
  hotspots: string[]; // gate IDs exceeding 80%
  recommendation: string;
}

// --- AccessibilityAgent ---

export interface AccessibilityAgentInput extends AgentBaseInput {
  /** Type of accessibility need */
  needType: 'wheelchair' | 'visual' | 'hearing' | 'general';
  /** Optional location context */
  nearGateId?: string;
  /** Text from another agent to reformat into simplified/accessible form */
  reformatText?: string;
}

export interface AccessibleFacility {
  id: string;
  name: string;
  type: 'entrance' | 'restroom' | 'medical' | 'exit' | 'elevator';
  gateId: string;
  distanceMeters: number;
  isWheelchairAccessible: boolean;
  directions: string;
}

export interface AccessibilityAgentOutput extends AgentBaseOutput {
  agentName: 'AccessibilityAgent';
  nearestFacilities: AccessibleFacility[];
  accessibleRoute?: NavigationStep[];
  simplifiedText?: string; // reformatted version of another agent's output
  audioDescription: string; // always present for screen-reader/TTS
}

// --- OpsOrchestratorAgent ---

export interface OpsOrchestratorAgentInput {
  crowdData: GateDensitySnapshot[];
  triggerGateId?: string; // gate that triggered the alert
  requestId?: string;
}

export interface OpsRecommendation {
  priority: number; // 1 = highest priority
  action: string;
  rationale: string;
  affectedGates: string[];
  estimatedReliefMinutes: number;
  requiredStaff: number;
  urgency: AlertSeverity;
}

export interface OpsOrchestratorAgentOutput extends AgentBaseOutput {
  agentName: 'OpsOrchestratorAgent';
  recommendations: OpsRecommendation[];
  summaryForDisplay: string;
  rawCrowdAnalysis: CrowdIntelligenceAgentOutput;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

/** POST /api/fan/chat */
export interface FanChatRequest {
  message: string;
  language: SupportedLanguage;
  sessionId?: string;
}

export interface FanChatResponse {
  reply: string;
  agentUsed: string;
  language: SupportedLanguage;
  timestamp: number;
}

/** POST /api/fan/navigate */
export interface FanNavigateRequest {
  from: string;
  to: string;
  language: SupportedLanguage;
  accessibilityRequired?: boolean;
}

export interface FanNavigateResponse {
  navigation: NavigationAgentOutput;
}

/** GET /api/fan/accessibility */
export interface FanAccessibilityResponse {
  facilities: AccessibleFacility[];
  message: string;
}

/** POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: {
    email: string;
    role: UserRole;
  };
}

/** GET /api/ops/crowd */
export interface OpsCrowdResponse {
  snapshots: GateDensitySnapshot[];
  timestamp: number;
}

/** POST /api/ops/alert */
export interface OpsAlertRequest {
  gateId: string;
  message?: string;
}

export interface OpsAlertResponse {
  alertId: string;
  recommendation: OpsOrchestratorAgentOutput;
}

/** GET /api/ops/recommendations */
export interface OpsRecommendationsResponse {
  recommendations: OpsRecommendation[];
  generatedAt: number;
}

// =============================================================================
// Auth / JWT Types
// =============================================================================

export type UserRole = 'fan' | 'staff' | 'admin';

export interface JWTPayload {
  sub: string; // user email
  role: UserRole;
  iat: number;
  exp: number;
}

// =============================================================================
// WebSocket Types
// =============================================================================

export interface WSCrowdUpdate {
  type: 'crowd_update';
  payload: GateDensitySnapshot[];
  timestamp: number;
}

export interface WSAlertNotification {
  type: 'alert';
  payload: CrowdAlert;
  timestamp: number;
}

export type WSMessage = WSCrowdUpdate | WSAlertNotification;

// =============================================================================
// Internal / Service Types
// =============================================================================

export interface KnowledgeBaseDocument {
  id: string;
  source: string; // filename
  content: string;
  keywords: string[];
}

export interface RAGResult {
  document: KnowledgeBaseDocument;
  score: number;
}

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

export interface GateRecord {
  id: string;
  name: string;
  location: string;
  capacity: number;
  accessibilityFeatures: string[];
  nearbyFacilities: string[];
  coordinates: { lat: number; lng: number };
}

export interface TransitRoute {
  id: string;
  name: string;
  type: 'metro' | 'shuttle' | 'bus' | 'walk';
  stops: string[];
  frequency: string;
  accessibilityEquipped: boolean;
}

export interface MedicalPoint {
  id: string;
  name: string;
  location: string;
  gateId: string;
  capabilities: string[];
  isWheelchairAccessible: boolean;
  phone: string;
}
