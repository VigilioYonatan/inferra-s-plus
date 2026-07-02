import { Heading, Link } from "../../libs/ui/components";

export function ForbiddenPage() {
  return (
    <div
      style={{
        maxWidth: "560px",
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
          marginBottom: "12px",
        }}
      >
        403
      </div>
      <Heading
        title="Acceso Restringido"
        desc="Tu usuario no cuenta con los permisos necesarios para acceder a este recurso o entorno de administración."
      />
      <div style={{ marginTop: "24px" }}>
        <Link href="/" class="btn btn-primary">
          Regresar al inicio
        </Link>
      </div>
    </div>
  );
}
