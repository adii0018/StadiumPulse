/**
 * @fileoverview API service — typed Axios client for all backend REST endpoints.
 */

import axios, { type AxiosInstance } from 'axios';
import type {
  FanChatRequest,
  FanChatResponse,
  FanNavigateRequest,
  FanNavigateResponse,
  LoginRequest,
  LoginResponse,
  OpsCrowdResponse,
  OpsAlertResponse,
  OpsRecommendationsResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// Re-export types for frontend consumption
export type {
  FanChatRequest,
  FanChatResponse,
  FanNavigateRequest,
  FanNavigateResponse,
  LoginRequest,
  LoginResponse,
  OpsCrowdResponse,
  OpsAlertResponse,
  OpsRecommendationsResponse,
};

function createApiClient(token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('sp_token');
        window.location.href = '/ops';
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const publicApi = createApiClient();

export function authedApi(): AxiosInstance {
  const token = localStorage.getItem('sp_token') ?? undefined;
  return createApiClient(token);
}

// ---------------------------------------------------------------------------
// Fan Companion endpoints
// ---------------------------------------------------------------------------

export async function fanChat(req: FanChatRequest): Promise<FanChatResponse> {
  const { data } = await publicApi.post<FanChatResponse>('/fan/chat', req);
  return data;
}

export async function fanNavigate(req: FanNavigateRequest): Promise<FanNavigateResponse> {
  const { data } = await publicApi.post<FanNavigateResponse>('/fan/navigate', req);
  return data;
}

export async function fanAccessibility(gateId?: string, needType?: string, language = 'en') {
  const params = new URLSearchParams();
  if (gateId) params.set('gateId', gateId);
  if (needType) params.set('needType', needType);
  params.set('language', language);
  const { data } = await publicApi.get(`/fan/accessibility?${params.toString()}`);
  return data;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await publicApi.post<LoginResponse>('/auth/login', req);
  return data;
}

// ---------------------------------------------------------------------------
// Ops Command Center endpoints
// ---------------------------------------------------------------------------

export async function getOpsCrowd(): Promise<OpsCrowdResponse> {
  const { data } = await authedApi().get<OpsCrowdResponse>('/ops/crowd');
  return data;
}

export async function triggerOpsAlert(gateId: string): Promise<OpsAlertResponse> {
  const { data } = await authedApi().post<OpsAlertResponse>('/ops/alert', { gateId });
  return data;
}

export async function getOpsRecommendations(): Promise<OpsRecommendationsResponse> {
  const { data } = await authedApi().get<OpsRecommendationsResponse>('/ops/recommendations');
  return data;
}

export async function getAlertLog() {
  const { data } = await authedApi().get('/ops/alerts/log');
  return data;
}
