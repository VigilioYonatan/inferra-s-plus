import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";

// Import this module before Nest and the HTTP clients to capture tracing. Exporters use OTEL_ env variables.
const enabled = Boolean(
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
);
export const telemetry = enabled
  ? new NodeSDK({
      serviceName: "inferra-api",
      instrumentations: [
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
      ],
    })
  : undefined;
if (telemetry) telemetry.start();
