/**
 * @fileoverview Ops Command Center controller — handles crowd data, alerts, and recommendations.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { crowdSimulator } from '../services/crowdSimulator.service';
import { runOpsOrchestratorAgent } from '../agents/opsOrchestratorAgent';
import { logAlert, getRecentAlerts } from '../db/sqlite';
import type {
  OpsAlertRequest,
  OpsAlertResponse,
  OpsCrowdResponse,
  OpsRecommendationsResponse,
} from '../types';

/**
 * GET /api/ops/crowd — returns the current crowd density snapshot.
 */
export async function handleGetCrowd(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const snapshots = crowdSimulator.getLatestSnapshot();
  const response: OpsCrowdResponse = { snapshots, timestamp: Date.now() };
  void reply.send(response);
}

/**
 * POST /api/ops/alert — manually triggers an alert and returns AI recommendations.
 */
export async function handlePostAlert(
  request: FastifyRequest<{ Body: OpsAlertRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const { gateId, message } = request.body;

  crowdSimulator.injectSurge(gateId, 95);
  const crowdData = crowdSimulator.getLatestSnapshot();
  const recommendation = await runOpsOrchestratorAgent({ crowdData, triggerGateId: gateId });

  const alertId = await logAlert({
    gateId,
    severity: 'critical',
    occupancy: 95,
    message: message ?? `Manual alert triggered for ${gateId}`,
    recommendation: JSON.stringify(recommendation.recommendations),
  });

  const response: OpsAlertResponse = { alertId: alertId.toString(), recommendation };
  void reply.send(response);
}

/**
 * GET /api/ops/recommendations — returns AI-generated recommendations.
 */
export async function handleGetRecommendations(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const crowdData = crowdSimulator.getLatestSnapshot();
  const result = await runOpsOrchestratorAgent({ crowdData });

  const response: OpsRecommendationsResponse = {
    recommendations: result.recommendations,
    generatedAt: result.timestamp,
  };
  void reply.send(response);
}

/**
 * GET /api/ops/alerts/log — returns recent alert log entries from the database.
 */
export async function handleGetAlertLog(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const alerts = await getRecentAlerts(20);
  void reply.send({ alerts, count: alerts.length });
}
