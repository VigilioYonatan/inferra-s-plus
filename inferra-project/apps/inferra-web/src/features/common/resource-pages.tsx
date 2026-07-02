import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { navigate, pathname } from "../../app/router";
import {
  Badge,
  Button,
  Empty,
  Heading,
  Link,
  Notice,
  Section,
  SkeletonCard,
  SkeletonTable,
  Spinner,
} from "../../libs/ui/components";
import { activeOrg } from "../../services/auth/auth.state";
import { postJson, requestJson } from "../../services/http/api-client";
import { useResource } from "../../services/http/use-resource";
export type EntityRow = Record<string, unknown>;
export type FormField = {
  name: string;
  label: string;
  type?: "text" | "number" | "checkbox" | "textarea" | "select" | "email";
  required?: boolean;
  min?: number;
  max?: number;
  choices?: { value: string; label: string }[];
  from?: string;
  optionLabel?: string;
  nullable?: boolean;
};
export function orgApi(collection: string) {
  const org = activeOrg.value;
  return org ? `/api/v1/organizations/${org.id}/${collection}` : null;
}
export function currentRecordId(lastIndex = 0) {
  const path = pathname.value.split("/").filter(Boolean);
  return decodeURIComponent(path[path.length - 1 - lastIndex] ?? "");
}
function display(value: unknown, key?: string): ComponentChildren {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") {
    return value ? (
      <Badge kind="success">Sí</Badge>
    ) : (
      <Badge kind="neutral">No</Badge>
    );
  }
  if (key && (key.includes("status") || key === "state")) {
    const s = String(value).toLowerCase();
    if (
      ["ready", "active", "completed", "ok", "running", "success"].includes(s)
    ) {
      return <Badge kind="success">{String(value)}</Badge>;
    }
    if (["pending", "queued", "in_progress", "configured"].includes(s)) {
      return <Badge kind="warning">{String(value)}</Badge>;
    }
    if (["failed", "error", "revoked", "disabled"].includes(s)) {
      return <Badge kind="danger">{String(value)}</Badge>;
    }
    return <Badge kind="neutral">{String(value)}</Badge>;
  }
  if (
    key &&
    (key.includes("_at") || key === "created" || key === "timestamp") &&
    typeof value === "string"
  ) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  }
  if (typeof value === "object") return JSON.stringify(value).slice(0, 180);
  return String(value).slice(0, 180);
}
function RowTable({
  data,
  fields,
}: {
  data: EntityRow[];
  fields: { key: string; label: string }[];
}) {
  return (
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.key} scope="col">
                {f.label}
              </th>
            ))}
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={String(row.id ?? i)}>
              {fields.map((f) => (
                <td key={f.key}>{display(row[f.key], f.key)}</td>
              ))}
              <td>
                {row.id ? (
                  <Link
                    href={`${pathname.value.replace(/\/$/, "")}/${encodeURIComponent(String(row.id))}`}
                  >
                    Ver detalle
                  </Link>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ResourceListPage({
  title,
  desc,
  collection,
  fields,
  newPath,
  admin = false,
}: {
  title: string;
  desc: string;
  collection: string;
  fields: { key: string; label: string }[];
  newPath?: string;
  admin?: boolean;
}) {
  const url = admin ? `/api/v1/admin/${collection}` : orgApi(collection);
  const resource = useResource<EntityRow[]>(url);
  return (
    <>
      <Heading title={title} desc={desc} />
      <Section
        title="Registros"
        sub="Datos reales obtenidos del backend; no se usan respuestas simuladas."
      >
        {newPath && (
          <p>
            <Link href={newPath}>Crear nuevo registro</Link>
          </p>
        )}
        {resource.loading ? (
          <SkeletonTable rows={5} cols={fields.length + 1} />
        ) : resource.error ? (
          <Notice kind="danger">
            <p>{resource.error}</p>
            <Button
              kind="ghost"
              size="sm"
              type="button"
              onClick={resource.reload}
              style={{ marginTop: "8px" }}
            >
              Reintentar
            </Button>
          </Notice>
        ) : resource.data?.length ? (
          <RowTable data={resource.data} fields={fields} />
        ) : (
          <Empty
            label="Todavía no hay registros"
            description="No se encontraron elementos disponibles en este momento."
            action={
              newPath ? (
                <Link href={newPath}>
                  <Button kind="primary" size="sm">
                    Crear registro
                  </Button>
                </Link>
              ) : undefined
            }
          />
        )}
        <p>
          <Button kind="ghost" type="button" onClick={resource.reload}>
            Actualizar
          </Button>
        </p>
      </Section>
    </>
  );
}
export function ResourceDetailPage({
  title,
  collection,
  fields,
  idPosition = 0,
  admin = false,
}: {
  title: string;
  collection: string;
  fields: { key: string; label: string }[];
  idPosition?: number;
  admin?: boolean;
}) {
  const id = currentRecordId(idPosition);
  const base = admin ? `/api/v1/admin/${collection}` : orgApi(collection);
  const resource = useResource<EntityRow>(
    base && id ? `${base}/${encodeURIComponent(id)}` : null,
  );
  return (
    <>
      <Heading
        title={title}
        desc="Detalle autorizado del recurso seleccionado"
      />
      <Section title="Información">
        {resource.loading ? (
          <SkeletonCard />
        ) : resource.error ? (
          <Notice kind="danger">
            <p>{resource.error}</p>
            <Button
              kind="ghost"
              size="sm"
              type="button"
              onClick={resource.reload}
              style={{ marginTop: "8px" }}
            >
              Reintentar
            </Button>
          </Notice>
        ) : resource.data ? (
          <dl class="details-list">
            {fields.map((f) => (
              <div key={f.key}>
                <dt>{f.label}</dt>
                <dd>{display(resource.data?.[f.key], f.key)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty
            label="Recurso no encontrado"
            description="El identificador no existe o no tiene permisos para acceder."
          />
        )}
        <Button kind="ghost" type="button" onClick={resource.reload}>
          Actualizar
        </Button>
      </Section>
    </>
  );
}
function ChoiceField({ field }: { field: FormField }) {
  const data = useResource<EntityRow[]>(field.from ? orgApi(field.from) : null);
  return (
    <label class="field">
      <span>{field.label}</span>
      <select
        name={field.name}
        required={field.required}
        aria-label={field.label}
      >
        <option value="">Selecciona una opción</option>
        {field.choices?.map((x) => (
          <option key={x.value} value={x.value}>
            {x.label}
          </option>
        ))}
        {data.data?.map((x) => (
          <option key={String(x.id)} value={String(x.id)}>
            {display(x[field.optionLabel ?? "name"])}
          </option>
        ))}
      </select>
      {data.error && <small role="alert">{data.error}</small>}
    </label>
  );
}
function EditorField({ field, value }: { field: FormField; value?: unknown }) {
  if (field.type === "select") return <ChoiceField field={field} />;
  if (field.type === "checkbox")
    return (
      <label class="field check">
        <span>{field.label}</span>
        <input
          type="checkbox"
          name={field.name}
          value="true"
          defaultChecked={value === true}
        />
      </label>
    );
  if (field.type === "textarea")
    return (
      <label class="field">
        <span>{field.label}</span>
        <textarea
          name={field.name}
          rows={4}
          required={field.required}
          defaultValue={typeof value === "string" ? value : ""}
        />
      </label>
    );
  const inputType =
    field.type === "number"
      ? "number"
      : field.type === "email"
        ? "email"
        : "text";
  return (
    <label class="field">
      <span>{field.label}</span>
      <input
        type={inputType as any}
        name={field.name}
        required={field.required}
        min={field.min}
        max={field.max}
        defaultValue={
          typeof value === "string" || typeof value === "number" ? value : ""
        }
      />
    </label>
  );
}
export function formPayload(
  form: HTMLFormElement,
  fields: FormField[],
): Record<string, unknown> {
  const fd = new FormData(form);
  return Object.fromEntries(
    fields.map((f) => {
      const value = fd.get(f.name);
      return [
        f.name,
        f.type === "checkbox"
          ? value === "true"
          : f.type === "number"
            ? value === null || value === ""
              ? undefined
              : Number(value)
            : value === ""
              ? f.nullable
                ? null
                : f.required
                  ? ""
                  : undefined
              : String(value ?? ""),
      ];
    }),
  );
}
export function ResourceCreatePage({
  title,
  collection,
  fields,
  successPath,
}: {
  title: string;
  collection: string;
  fields: FormField[];
  successPath: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const endpoint = orgApi(collection);
  async function submit(e: Event) {
    e.preventDefault();
    if (!endpoint) return;
    setBusy(true);
    setError("");
    try {
      await postJson(
        endpoint,
        formPayload(e.currentTarget as HTMLFormElement, fields),
      );
      setMessage("Registro creado correctamente");
      navigate(successPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title={title}
        desc="Los datos se validan en el servidor y se asocian a tu organización."
      />
      <Section title="Datos del recurso">
        {error && <Notice kind="danger">{error}</Notice>}
        {message && <Notice kind="success">{message}</Notice>}
        <form onSubmit={submit}>
          {fields.map((f) => (
            <EditorField key={f.name} field={f} />
          ))}
          <Button disabled={busy} type="submit">
            {busy ? "Guardando…" : "Crear"}
          </Button>
        </form>
      </Section>
    </>
  );
}
export function ResourceEditPage({
  title,
  collection,
  fields,
  idPosition = 0,
}: {
  title: string;
  collection: string;
  fields: FormField[];
  idPosition?: number;
}) {
  const id = currentRecordId(idPosition);
  const base = orgApi(collection);
  const record = useResource<EntityRow>(
    base ? `${base}/${encodeURIComponent(id)}` : null,
  );
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    if (!base) return;
    setBusy(true);
    setError("");
    try {
      await requestJson(`${base}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(
          formPayload(e.currentTarget as HTMLFormElement, fields),
        ),
      });
      setSuccess("Cambios guardados");
      record.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo modificar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading title={title} desc="Modificar configuración autorizada" />
      <Section title="Configuración">
        {record.loading ? (
          <Spinner />
        ) : record.error ? (
          <Notice kind="danger">{record.error}</Notice>
        ) : (
          <form key={id} onSubmit={submit}>
            {error && <Notice kind="danger">{error}</Notice>}
            {success && <Notice kind="success">{success}</Notice>}
            {fields.map((f) => (
              <EditorField
                key={f.name}
                field={f}
                value={record.data?.[f.name]}
              />
            ))}
            <Button disabled={busy} type="submit">
              Guardar cambios
            </Button>
          </form>
        )}
      </Section>
    </>
  );
}
export function DataReportPage({
  title,
  desc,
  endpoint,
}: {
  title: string;
  desc: string;
  endpoint: string;
}) {
  const url = endpoint.startsWith("/api/") ? endpoint : orgApi(endpoint);
  const data = useResource<EntityRow>(url);
  return (
    <>
      <Heading title={title} desc={desc} />
      <Section title="Reporte operacional">
        {data.loading ? (
          <SkeletonCard />
        ) : data.error ? (
          <Notice kind="danger">
            <p>{data.error}</p>
            <Button
              kind="ghost"
              size="sm"
              type="button"
              onClick={data.reload}
              style={{ marginTop: "8px" }}
            >
              Reintentar
            </Button>
          </Notice>
        ) : data.data ? (
          <dl class="details-list">
            {Object.entries(data.data).map(([name, value]) => (
              <div key={name}>
                <dt>{name.replaceAll("_", " ")}</dt>
                <dd>{display(value, name)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty
            label="No hay datos disponibles"
            description="El reporte no contiene métricas registradas en el período seleccionado."
          />
        )}
        <div style={{ marginTop: "16px" }}>
          <Button kind="ghost" type="button" onClick={data.reload}>
            Actualizar reporte
          </Button>
        </div>
      </Section>
    </>
  );
}
export function NotAvailablePage({
  title,
  details,
}: {
  title: string;
  details: string;
}) {
  return (
    <>
      <Heading title={title} desc="Operación protegida" />
      <Section title="Requiere infraestructura adicional">
        <Notice>{details}</Notice>
      </Section>
    </>
  );
}
