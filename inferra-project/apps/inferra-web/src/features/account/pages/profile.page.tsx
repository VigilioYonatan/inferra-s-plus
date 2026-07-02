import {
  Badge,
  CopyButton,
  Heading,
  Link,
  Notice,
} from "../../../libs/ui/components";
import { activeOrg, viewer } from "../../../services/auth/auth.state";

export function ProfilePage() {
  const me = viewer.value;
  const org = activeOrg.value;
  const initial = me?.email ? me.email.charAt(0).toUpperCase() : "U";

  return (
    <>
      <Heading
        title="Mi Perfil"
        desc="Detalles de tu cuenta autenticada y configuración de acceso a la infraestructura."
      />

      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar-lg">{initial}</div>
          <div class="profile-info">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {me?.display_name || me?.email?.split("@")[0] || "Usuario"}
              </h3>
              <Badge kind="success">Cuenta Activa</Badge>
            </div>
            <p>{me?.email || "Sin correo asociado"}</p>
          </div>
        </div>

        <div class="profile-grid">
          <div class="profile-item">
            <label>Correo Electrónico</label>
            <div class="val">{me?.email || "—"}</div>
          </div>

          <div class="profile-item">
            <label>Nombre Mostrado</label>
            <div class="val">{me?.display_name || "No configurado"}</div>
          </div>

          <div class="profile-item" style={{ gridColumn: "span 2" }}>
            <label>ID Único de Usuario</label>
            <div
              class="val"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <code style={{ fontSize: "12px" }}>{me?.id || "—"}</code>
              {me?.id && <CopyButton text={me.id} />}
            </div>
          </div>

          <div class="profile-item">
            <label>Organización Activa</label>
            <div class="val">{org?.name || "Sin organización"}</div>
          </div>
        </div>

        <Notice kind="info">
          Para modificar tu contraseña o configurar autenticación de doble
          factor (2FA/TOTP), dirígete a{" "}
          <Link href="/account/security">Seguridad de la cuenta</Link>.
        </Notice>
      </div>
    </>
  );
}
