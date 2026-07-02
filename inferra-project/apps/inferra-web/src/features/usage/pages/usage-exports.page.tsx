import { useState } from "preact/hooks";
import { Button, Heading, Notice, Section } from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";

export function UsageExportsPage() {
  const org = activeOrg.value;
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [timeframe, setTimeframe] = useState("30d");
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleExport = async (e: Event) => {
    e.preventDefault();
    if (!org) return;
    setDownloading(true);
    setNotice(null);

    try {
      // Fetch the usage requests
      const res = await fetch(
        `/api/v1/organizations/${org.id}/usage/requests`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (!res.ok) throw new Error("Error obteniendo datos para exportar");
      const records = await res.json();

      let content = "";
      let filename = `inferra-usage-${org.slug}-${new Date().toISOString().slice(0, 10)}`;
      let mimeType = "";

      if (format === "csv") {
        mimeType = "text/csv;charset=utf-8;";
        filename += ".csv";
        const headers = [
          "id",
          "created_at",
          "status",
          "prompt_tokens",
          "completion_tokens",
          "elapsed_ms",
        ];
        const rows = records.map((r: any) =>
          headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
        );
        content = [headers.join(","), ...rows].join("\n");
      } else {
        mimeType = "application/json;charset=utf-8;";
        filename += ".json";
        content = JSON.stringify(records, null, 2);
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotice(`Exportación descargada correctamente: ${filename}`);
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Error durante la exportación",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Heading
        title="Exportación de Datos de Consumo"
        desc="Descarga el historial de inferencias y consumo de tokens en formatos CSV o JSON para análisis contable, chargeback interno o auditoría."
      />

      {notice && (
        <Notice kind={notice.includes("correctamente") ? "success" : "danger"}>
          {notice}
        </Notice>
      )}

      <Section title="Generar nuevo reporte de consumo">
        <form onSubmit={handleExport} style={{ maxWidth: "540px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              for="exp-timeframe"
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Ventana de tiempo
            </label>
            <select
              id="exp-timeframe"
              value={timeframe}
              onChange={(e: any) => setTimeframe(e.target.value)}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="all">Todo el historial disponible</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <span
              class="field-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Formato de archivo
            </span>
            <div style={{ display: "flex", gap: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === "csv"}
                  onChange={() => setFormat("csv")}
                />
                CSV (Hojas de cálculo / Excel)
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === "json"}
                  onChange={() => setFormat("json")}
                />
                JSON (Estructurado / APIs)
              </label>
            </div>
          </div>

          <Button kind="primary" loading={downloading} type="submit">
            Descargar archivo de auditoría
          </Button>
        </form>
      </Section>
    </>
  );
}
