import { Badge, Heading, Link, Section } from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";

type PermissionRow = {
  scope: string;
  description: string;
  owner: boolean;
  admin: boolean;
  member: boolean;
  analyst: boolean;
};

const permissionsMatrix: PermissionRow[] = [
  {
    scope: "inference:invoke",
    description: "Invocar endpoints de chat, completado y embeddings (/v1)",
    owner: true,
    admin: true,
    member: true,
    analyst: false,
  },
  {
    scope: "models:read",
    description: "Consultar catálogo de modelos activos y capacidades",
    owner: true,
    admin: true,
    member: true,
    analyst: true,
  },
  {
    scope: "models:write",
    description:
      "Registrar nuevos modelos, importar de Hugging Face y configurar presets",
    owner: true,
    admin: true,
    member: false,
    analyst: false,
  },
  {
    scope: "deployments:manage",
    description: "Crear, activar, detener o reiniciar perfiles de despliegue",
    owner: true,
    admin: true,
    member: false,
    analyst: false,
  },
  {
    scope: "credentials:manage",
    description: "Emitir, rotar y revocar API keys con step-up",
    owner: true,
    admin: true,
    member: false,
    analyst: false,
  },
  {
    scope: "members:manage",
    description: "Invitar nuevos usuarios, cambiar roles y remover miembros",
    owner: true,
    admin: true,
    member: false,
    analyst: false,
  },
  {
    scope: "webhooks:manage",
    description:
      "Configurar endpoints de webhook y rotar secretos de firma HMAC",
    owner: true,
    admin: true,
    member: false,
    analyst: false,
  },
  {
    scope: "audit:read",
    description:
      "Consultar el log inmutable de auditoría y trazas de seguridad",
    owner: true,
    admin: true,
    member: false,
    analyst: true,
  },
  {
    scope: "usage:read",
    description:
      "Acceder a métricas de consumo, latencia, errores y costos estimados",
    owner: true,
    admin: true,
    member: true,
    analyst: true,
  },
  {
    scope: "org:manage",
    description: "Modificar nombre de la organización, slug y ajustes maestros",
    owner: true,
    admin: false,
    member: false,
    analyst: false,
  },
];

export function RolesMatrixPage() {
  const org = activeOrg.value;

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Link
          href={`/app/${org?.slug}/members`}
          style={{ fontSize: "13px", color: "var(--muted)" }}
        >
          ← Volver a Miembros
        </Link>
      </div>

      <Heading
        title="Matriz de Roles y Permisos (RBAC)"
        desc="Mapa de privilegios asignados por rol en la organización según la política de autorización de Inferra S+."
      />

      <Section title="Definición de privilegios por perfil">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Permiso / Scope</th>
                <th>Descripción</th>
                <th style={{ textAlign: "center" }}>Owner</th>
                <th style={{ textAlign: "center" }}>Admin</th>
                <th style={{ textAlign: "center" }}>Member</th>
                <th style={{ textAlign: "center" }}>Analyst</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((p) => (
                <tr key={p.scope}>
                  <td>
                    <code>{p.scope}</code>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{p.description}</td>
                  <td style={{ textAlign: "center" }}>
                    {p.owner ? (
                      <Badge kind="success">Permitido</Badge>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.admin ? (
                      <Badge kind="success">Permitido</Badge>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.member ? (
                      <Badge kind="info">Permitido</Badge>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.analyst ? (
                      <Badge kind="warning">Lectura</Badge>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
