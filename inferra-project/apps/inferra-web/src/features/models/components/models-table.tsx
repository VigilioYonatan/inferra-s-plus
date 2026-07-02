import { Badge } from "../../../libs/ui/components";
import { BrainIcon } from "../../../libs/ui/icons";

export type ModelItem = {
  id: string;
  public_name: string;
  upstream_name?: string;
  context_window: number;
  enabled: boolean;
};

export type ModelsTableProps = {
  models: ModelItem[];
};

export function ModelsTable({ models }: ModelsTableProps) {
  return (
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Modelo</th>
            <th>Contexto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BrainIcon size={16} color="var(--accent)" />
                  <strong style={{ color: "var(--text)" }}>{m.public_name}</strong>
                </div>
              </td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                {m.context_window.toLocaleString()} tokens
              </td>
              <td>
                <Badge kind={m.enabled ? "success" : "neutral"}>
                  {m.enabled ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
