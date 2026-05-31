import {
  MetricsByStatusResponse,
  MetricsByPriorityResponse,
  AverageTimeResponse,
  TimelineResponse,
  ThroughputResponse,
  ResponseTimeResponse,
} from "@/types/metrics.types";

const BASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://127.0.0.1:8000";

async function fetchMetrics<T>(endpoint: string, token: string): Promise<T> {
  console.log("%c[Analytics API]", "color: #e67e22", "GET", endpoint);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("%c[Analytics API]", "color: #e74c3c", "GET", endpoint, "→", res.status);
    throw new Error(`Erro ao buscar métricas: ${res.status}`);
  }

  console.log("%c[Analytics API]", "color: #e67e22", "GET", endpoint, "→", res.status);
  return res.json();
}

export const analyticsApi = {
  getByStatus: (token: string) =>
    fetchMetrics<MetricsByStatusResponse>("/task/metrics/by-status", token),
  getByPriority: (token: string) =>
    fetchMetrics<MetricsByPriorityResponse>("/task/metrics/by-priority", token),
  getAverageTime: (token: string) =>
    fetchMetrics<AverageTimeResponse>("/task/metrics/average-time", token),
  getTimeline: (token: string) =>
    fetchMetrics<TimelineResponse>("/task/metrics/backlog", token),
  getThroughput: (token: string) =>
    fetchMetrics<ThroughputResponse>("/task/metrics/throughput", token),
  getResponseTime: (token: string) =>
    fetchMetrics<ResponseTimeResponse>("/task/metrics/response-time", token),
};
