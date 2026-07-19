/**
 * Frontend shared types — mirrors the backend types relevant to the UI.
 * Keeps the frontend fully typed without importing from the backend package.
 */

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SupportedLanguage = 'en' | 'es' | 'hi';
export type UserRole = 'fan' | 'staff' | 'admin';

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

export interface FanNavigateRequest {
  from: string;
  to: string;
  language: SupportedLanguage;
  accessibilityRequired?: boolean;
}

export interface NavigationStep {
  stepNumber: number;
  instruction: string;
  landmark?: string;
  estimatedTimeSeconds: number;
}

export interface FanNavigateResponse {
  navigation: {
    primaryRoute: NavigationStep[];
    alternateRoute?: NavigationStep[];
    primaryCongestionLevel: number;
    alternateRecommended: boolean;
    totalEstimatedMinutes: number;
    fromCache: boolean;
    timestamp: number;
  };
}

export interface GateDensitySnapshot {
  gateId: string;
  gateName: string;
  currentOccupancy: number;
  capacity: number;
  trend: 'rising' | 'falling' | 'stable';
  timestamp: number;
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

export interface OpsRecommendation {
  priority: number;
  action: string;
  rationale: string;
  affectedGates: string[];
  estimatedReliefMinutes: number;
  requiredStaff: number;
  urgency: AlertSeverity;
}

export interface OpsCrowdResponse {
  snapshots: GateDensitySnapshot[];
  timestamp: number;
}

export interface OpsRecommendationsResponse {
  recommendations: OpsRecommendation[];
  generatedAt: number;
}

export interface OpsAlertResponse {
  alertId: string;
  recommendation: {
    recommendations: OpsRecommendation[];
    summaryForDisplay: string;
    rawCrowdAnalysis: {
      alerts: CrowdAlert[];
      overallStadiumLoad: number;
      hotspots: string[];
    };
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: { email: string; role: UserRole };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language: SupportedLanguage;
}

export interface WSMessage {
  type: 'crowd_update' | 'alert';
  payload: GateDensitySnapshot[] | CrowdAlert;
  timestamp: number;
}
