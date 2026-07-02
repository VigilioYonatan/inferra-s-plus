import { useEffect } from "preact/hooks";
import { navigate } from "../../../app/router";
import { refreshSession } from "../../../services/auth/auth.state";
export function OAuthCompletePage() {
  useEffect(() => {
    refreshSession().then(() => navigate("/onboarding"));
  }, []);
  return (
    <div role="status" class="centered">
      Completando inicio de sesión…
    </div>
  );
}
