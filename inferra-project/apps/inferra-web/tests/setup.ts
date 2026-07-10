import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  window.scrollTo = () => {};
  window.matchMedia =
    window.matchMedia ||
    (() =>
      ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList);
}

if (typeof globalThis.fetch !== "undefined") {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (urlStr.includes("/api/v1/auth/me")) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            user: {
              id: "00000000-0000-0000-0000-000000000002",
              email: "admin@inferra.internal",
              display_name: "Admin Senior",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    }
    if (urlStr.includes("/api/v1/organizations")) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              id: "00000000-0000-0000-0000-000000000001",
              slug: "inferra-org",
              name: "Inferra Enterprise Org",
              role: "owner",
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    }
    if (urlStr.startsWith("/")) {
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true, data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
    return originalFetch(input, init);
  }) as typeof fetch;
}
