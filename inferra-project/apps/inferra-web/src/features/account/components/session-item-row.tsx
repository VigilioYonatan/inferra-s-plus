import { Badge, Button } from "../../../libs/ui/components";
import { LaptopIcon } from "../../../libs/ui/icons";

export type SessionItem = {
  id: string;
  created_at: string;
  expires_at: string;
  revoked_at?: string | null;
  mfa_verified?: boolean;
};

export type SessionItemRowProps = {
  session: SessionItem;
  isCurrentSession: boolean;
  onRevoke: (id: string) => void;
};

export function SessionItemRow({ session, isCurrentSession, onRevoke }: SessionItemRowProps) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            background: isCurrentSession ? "rgba(99, 102, 241, 0.08)" : "var(--surface)",
            border: isCurrentSession ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isCurrentSession ? "var(--accent)" : "var(--muted)",
            flexShrink: 0,
          }}
        >
          <LaptopIcon size={18} color={isCurrentSession ? "var(--accent)" : "var(--muted)"} />
        </div>
        <div class="stack">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <strong style={{ fontSize: "14px" }}>
              Sesión Web · <code>{session.id.slice(0, 8)}…</code>
            </strong>
            {isCurrentSession && (
              <Badge kind="success">Sesión actual</Badge>
            )}
            {session.mfa_verified && (
              <Badge kind="neutral">MFA Activo</Badge>
            )}
          </div>
          <small style={{ color: "var(--muted)" }}>
            Iniciada el {new Date(session.created_at).toLocaleString()} · Expira {new Date(session.expires_at).toLocaleString()}
          </small>
        </div>
      </div>
      {!isCurrentSession && (
        <Button
          kind="danger"
          size="sm"
          type="button"
          onClick={() => onRevoke(session.id)}
        >
          Revocar
        </Button>
      )}
    </li>
  );
}
