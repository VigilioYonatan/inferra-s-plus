import { useState } from "preact/hooks";
import { navigate } from "../../../app/router";
import { Button, Link, Notice } from "../../../libs/ui/components";
import { refreshSession, viewer } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
export function InvitationAcceptPage() {
  const token = new URLSearchParams(location.search).get("token") || "";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function accept() {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      await postJson("/api/v1/invitations/accept", { token });
      await refreshSession();
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aceptar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main class="auth-page simple">
      <section class="auth-card">
        <h1>Invitación a Inferra</h1>
        <p>
          La invitación solo puede aceptar la cuenta con el mismo correo al que
          fue enviada.
        </p>
        {error && <Notice kind="danger">{error}</Notice>}
        {!token ? (
          <Notice kind="danger">Enlace incompleto.</Notice>
        ) : !viewer.value ? (
          <>
            <Notice>
              Inicia sesión y vuelve a abrir el enlace de invitación.
            </Notice>
            <Link href="/login">Iniciar sesión</Link>
          </>
        ) : (
          <Button type="button" disabled={busy} onClick={accept}>
            {busy ? "Aceptando…" : "Aceptar invitación"}
          </Button>
        )}
      </section>
    </main>
  );
}
