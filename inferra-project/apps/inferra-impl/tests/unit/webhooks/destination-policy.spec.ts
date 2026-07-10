import { beforeAll, describe, expect, it } from "vitest";

let validateWebhookUrl: (url: string) => string;
let isPublicIPv4: (address: string) => boolean;
beforeAll(async () => {
  process.env.WEBHOOK_ALLOWED_HOSTS =
    "hooks.example.org,notifications.example.com";
  const m = await import(
    "../../../src/modules/webhooks/domain/services/destination.policy"
  );
  validateWebhookUrl = m.validateWebhookUrl;
  isPublicIPv4 = m.isPublicIPv4;
});
describe("webhook SSRF boundary", () => {
  it("requires an exact permitted HTTPS hostname", () => {
    expect(validateWebhookUrl("https://hooks.example.org/receiver")).toBe(
      "https://hooks.example.org/receiver",
    );
    expect(() =>
      validateWebhookUrl("https://evil.hooks.example.org/"),
    ).toThrow();
  });
  it("forbids credentialed and insecure destination URLs", () => {
    for (const url of [
      "http://hooks.example.org/a",
      "https://u:p@hooks.example.org/x",
      "https://hooks.example.org:444/x",
      "https://hooks.example.org/a#frag",
    ])
      expect(() => validateWebhookUrl(url)).toThrow();
  });
  it("blocks link-local, private, loopback and metadata IP ranges", () => {
    for (const ip of [
      "127.0.0.1",
      "10.2.3.4",
      "172.16.3.1",
      "192.168.0.2",
      "169.254.169.254",
      "0.0.0.0",
      "224.0.0.1",
      "100.64.0.1",
      "203.0.113.2",
      "198.51.100.1",
      "bad-ip",
    ])
      expect(isPublicIPv4(ip)).toBe(false);
  });
  it("permits globally reachable IPv4 addresses", () => {
    expect(isPublicIPv4("1.1.1.1")).toBe(true);
    expect(isPublicIPv4("8.8.8.8")).toBe(true);
  });
});
