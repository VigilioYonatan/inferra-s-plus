import { createHmac } from "node:crypto";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import {
  isPublicIPv4,
  validateWebhookUrl,
} from "../../domain/services/destination.policy";
export async function sendSignedWebhook(
  rawUrl: string,
  secret: string,
  envelope: Record<string, unknown>,
) {
  const url = new URL(validateWebhookUrl(rawUrl));
  const addresses = await lookup(url.hostname, { family: 4, all: true });
  if (!addresses.length || addresses.some((x) => !isPublicIPv4(x.address)))
    throw new Error(
      "Destination DNS does not resolve exclusively to public IPv4 addresses",
    );
  const body = JSON.stringify(envelope);
  if (Buffer.byteLength(body) > 16384)
    throw new Error("Webhook payload too large");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const target = addresses[0];
  if (!target) throw new Error("No IP address resolved");
  const ip = target.address;
  return new Promise<void>((resolve, reject) => {
    const req = request(
      {
        hostname: ip,
        port: 443,
        servername: url.hostname,
        path: url.pathname + url.search,
        method: "POST",
        rejectUnauthorized: true,
        timeout: 5000,
        headers: {
          host: url.hostname,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          "user-agent": "inferra-webhooks/1",
          "x-inferra-event": String(envelope.type ?? ""),
          "x-inferra-signature": `t=${timestamp},v1=${signature}`,
        },
      },
      (res) => {
        res.resume();
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300)
            resolve();
          else reject(new Error(`HTTP ${res.statusCode ?? "unknown"}`));
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error("Webhook timeout")));
    req.on("error", reject);
    req.end(body);
  });
}
