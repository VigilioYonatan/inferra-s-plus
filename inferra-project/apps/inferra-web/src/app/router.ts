import { signal } from "@preact/signals";
export const pathname = signal(window.location.pathname);
export function navigate(path: string) {
  if (!path.startsWith("/") || path.startsWith("//"))
    throw new Error("Invalid local path");
  window.history.pushState(null, "", path);
  pathname.value = path;
  window.scrollTo({ top: 0, behavior: "instant" });
}
window.addEventListener("popstate", () => {
  pathname.value = window.location.pathname;
});
export function matches(pattern: string, path: string) {
  const keys: string[] = [];
  const regexp = new RegExp(
    "^" +
      pattern
        .replace(/:([a-z_]+)/g, (_, key: string) => {
          keys.push(key);
          return "([^/]+)";
        })
        .replace(/\//g, "/") +
      "/?$",
  );
  const matched = path.match(regexp);
  if (!matched) return null;
  return Object.fromEntries(
    keys.map((key, index) => [
      key,
      decodeURIComponent(matched[index + 1] || ""),
    ]),
  );
}
