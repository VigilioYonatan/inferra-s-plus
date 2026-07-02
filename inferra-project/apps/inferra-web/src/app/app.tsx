import { useEffect } from "preact/hooks";
import { ErrorBoundary, Heading, Link, Spinner } from "../libs/ui/components";
import {
  activeOrg,
  organizations,
  refreshSession,
  sessionLoading,
  viewer,
} from "../services/auth/auth.state";
import { AppLayout } from "./layout";
import { appRoutes } from "./route-registry";
import { matches, navigate, pathname } from "./router";

export function App() {
  useEffect(() => {
    void refreshSession();
  }, []);

  const path = pathname.value;

  const publicPath = [
    "/register/verify",
    "/invite/accept",
    "/login",
    "/register",
    "/login/otp",
    "/password/forgot",
    "/password/reset",
    "/auth/complete",
    "/auth/error",
    "/mfa/challenge",
    "/403",
  ].includes(path);

  if (sessionLoading.value && !publicPath) {
    return (
      <main class="centered">
        <Spinner />
        <p
          style={{ color: "var(--muted)", marginTop: "12px", fontSize: "14px" }}
        >
          Comprobando sesión…
        </p>
      </main>
    );
  }

  if (!viewer.value && !publicPath) {
    queueMicrotask(() => navigate("/login"));
    return (
      <main class="centered">
        <Spinner />
      </main>
    );
  }

  if (path === "/") {
    queueMicrotask(() => {
      if (viewer.value) {
        const orgSlug = activeOrg.value?.slug || organizations.value[0]?.slug;
        navigate(orgSlug ? `/app/${orgSlug}/dashboard` : "/onboarding");
      } else {
        navigate("/login");
      }
    });
    return (
      <main class="centered">
        <Spinner />
      </main>
    );
  }

  const route = appRoutes.find((x) => matches(x.pattern, path) !== null);

  if (!route) {
    return (
      <main
        class="centered"
        style={{
          maxWidth: "520px",
          margin: "80px auto",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--muted)",
            marginBottom: "8px",
          }}
        >
          404
        </div>
        <Heading
          title="Página no encontrada"
          desc="La ruta a la que intentas acceder no existe en la plataforma o ha sido reubicada."
        />
        <div style={{ marginTop: "20px" }}>
          <Link href={viewer.value ? "/" : "/login"} class="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const Page = route.component;

  return publicPath ? (
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>
  ) : (
    <AppLayout>
      <ErrorBoundary>
        <Page />
      </ErrorBoundary>
    </AppLayout>
  );
}
