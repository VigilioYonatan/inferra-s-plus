import { computed, signal } from "@preact/signals";
import { pathname } from "../../app/router";
import { requestJson } from "../http/api-client";
export type Viewer = { id: string; email: string; display_name: string | null };
export type Organization = {
  id: string;
  slug: string;
  name: string;
  role: string;
};
export const viewer = signal<Viewer | null>(null);
export const organizations = signal<Organization[]>([]);
export const sessionLoading = signal(true);
export const signedIn = computed(() => viewer.value !== null);
export const activeOrg = computed(
  () =>
    organizations.value.find((x) => x.slug === pathname.value.split("/")[2]) ||
    organizations.value[0] ||
    null,
);
export async function refreshSession() {
  sessionLoading.value = true;
  try {
    const data = await requestJson<{ user: Viewer }>("/api/v1/auth/me");
    viewer.value = data.user;
    organizations.value = await requestJson<Organization[]>(
      "/api/v1/organizations",
    );
  } catch {
    viewer.value = null;
    organizations.value = [];
  } finally {
    sessionLoading.value = false;
  }
}
export async function logout() {
  await requestJson("/api/v1/auth/logout", { method: "POST" });
  viewer.value = null;
  organizations.value = [];
  window.location.assign("/login");
}
