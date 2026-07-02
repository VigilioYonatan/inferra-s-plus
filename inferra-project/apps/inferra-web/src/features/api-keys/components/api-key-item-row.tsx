import { Badge, Button } from "../../../libs/ui/components";
import { KeyIcon } from "../../../libs/ui/icons";

export type ApiKeyItem = {
  id: string;
  name: string;
  token_prefix: string;
  scopes?: string[];
  created_at: string;
  revoked_at: string | null;
};

export type ApiKeyItemRowProps = {
  apiKey: ApiKeyItem;
  onRequestAction: (action: "rotate" | "revoke", id: string) => void;
};

export function ApiKeyItemRow({ apiKey, onRequestAction }: ApiKeyItemRowProps) {
  const isRevoked = Boolean(apiKey.revoked_at);

  return (
    <li
      class="panel"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: isRevoked ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
            border: isRevoked ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isRevoked ? "var(--bad)" : "#f59e0b",
            flexShrink: 0,
          }}
        >
          <KeyIcon size={18} color={isRevoked ? "var(--bad)" : "#f59e0b"} />
        </div>
        <div class="stack">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <strong>{apiKey.name}</strong>
            <Badge kind={isRevoked ? "danger" : "success"}>
              {isRevoked ? "Revocada" : "Activa"}
            </Badge>
          </div>
          <small style={{ color: "var(--muted)" }}>
            Prefijo: <code>{apiKey.token_prefix}…</code> · Creada:{" "}
            {new Date(apiKey.created_at).toLocaleDateString()}
          </small>
        </div>
      </div>

      {!isRevoked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Button
            kind="ghost"
            size="sm"
            type="button"
            onClick={() => onRequestAction("rotate", apiKey.id)}
          >
            Rotar
          </Button>
          <Button
            kind="danger"
            size="sm"
            type="button"
            onClick={() => onRequestAction("revoke", apiKey.id)}
          >
            Revocar
          </Button>
        </div>
      )}
    </li>
  );
}
