import { Badge, Button } from "../../../libs/ui/components";
import { ShieldCheckIcon, ShieldIcon } from "../../../libs/ui/icons";

export type ApiKeyStepUpPanelProps = {
  isPrivileged: boolean;
  stepUpPassword: string;
  stepUpLoading: boolean;
  stepUpError: string | null;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: any) => void;
};

export function ApiKeyStepUpPanel({
  isPrivileged,
  stepUpPassword,
  stepUpLoading,
  stepUpError,
  onPasswordChange,
  onSubmit,
}: ApiKeyStepUpPanelProps) {
  return (
    <div
      class="panel"
      style={{
        borderLeft: "3px solid var(--accent)",
        background: "linear-gradient(90deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%), var(--panel)",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <ShieldIcon size={18} color="var(--accent)" />
          <strong style={{ fontSize: "14px", color: "var(--text)" }}>Elevación de Privilegios (Step-up Auth)</strong>
        </div>
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
          Por seguridad enterprise, la visualización o generación de secretos requiere validar la contraseña del operador en los últimos 15 minutos.
        </p>
      </div>

      {isPrivileged ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--good-bg)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "var(--good)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheckIcon size={18} color="var(--good)" />
            Identidad verificada con éxito. Operaciones sensibles habilitadas.
          </span>
          <Badge kind="success">Privilegio Activo</Badge>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr auto",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--text)", paddingBottom: "8px" }}>
            Contraseña actual:
          </div>
          <div>
            <input
              type="password"
              placeholder="Ingresa tu contraseña para autorizar..."
              value={stepUpPassword}
              onInput={(e: any) =>
                onPasswordChange(e.currentTarget.value)
              }
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "13px",
              }}
            />
          </div>
          <Button type="submit" disabled={stepUpLoading || !stepUpPassword}>
            {stepUpLoading ? "Verificando..." : "Desbloquear Secretos"}
          </Button>
        </form>
      )}

      {stepUpError && (
        <div
          style={{
            color: "var(--bad)",
            fontSize: "12px",
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>Error de validación: {stepUpError}</span>
        </div>
      )}
    </div>
  );
}
