import { Heading, Notice, Section } from "../../../libs/ui/components";
export function SocialConnectionsPage() {
  return (
    <>
      <Heading
        title="Identidades vinculadas"
        desc="Conecta proveedores a una cuenta ya verificada. Tu identidad no se vinculará automáticamente por correo."
      />
      <Section title="Proveedores OAuth">
        <p>
          Para vincular una cuenta, asegúrate de haber iniciado sesión con tu
          método actual.
        </p>
        <p>
          <a class="btn btn-ghost" href="/api/v1/auth/oauth/google/link/start">
            Vincular Google
          </a>{" "}
          <a
            class="btn btn-ghost"
            href="/api/v1/auth/oauth/facebook/link/start"
          >
            Vincular Facebook
          </a>
        </p>
        <Notice>
          Desvinculación y reautenticación avanzada todavía pendientes. No se
          puede vincular una cuenta social ya asociada a otro usuario.
        </Notice>
      </Section>
    </>
  );
}
