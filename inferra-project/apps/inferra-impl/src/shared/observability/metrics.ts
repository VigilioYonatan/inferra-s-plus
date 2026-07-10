import {
  Counter,
  collectDefaultMetrics,
  Gauge,
  Histogram,
  register,
} from "prom-client";

collectDefaultMetrics({ prefix: "inferra_" });
export const inferenceTotal = new Counter({
  name: "inferra_inference_requests_total",
  help: "Completed inference requests",
  labelNames: ["status"] as const,
});
export const inferenceDuration = new Histogram({
  name: "inferra_inference_duration_seconds",
  help: "Inference request duration",
  labelNames: ["status"] as const,
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 30, 60, 120],
});
export const inferenceTtft = new Histogram({
  name: "inferra_inference_ttft_seconds",
  help: "Time until first streamed token",
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 30],
});
export const inferenceActive = new Gauge({
  name: "inferra_inference_active",
  help: "Active inference streams",
});
export { register };
