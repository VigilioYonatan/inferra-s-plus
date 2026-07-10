# 03 — Identity: register, Google, Facebook, OTP, MFA y autorización

## Métodos de acceso y configuración

| Método | Flujo | Pruebas imprescindibles |
|---|---|---|
| Password | registro/login con contraseña Argon2id y correo verificado | hash correcto, password incorrecto, lockout, recuperación, rate limit y anti-enumeración |
| Email OTP passwordless | challenge con TTL y 1 uso, enviar vía SMTP, verificar en transacción | replay, concurrencia doble verify, expires, máximo intentos, challenge viejo, reenvío/cooldown |
| Google | OIDC authorization code + PKCE/state/nonce; validar issuer/audience/signature, correo verificado cuando se use | state/nonce invalid, token wrong aud/iss, PKCE, usuario ya vinculado |
| Facebook | OAuth Authorization Code + state; validar token vía proveedor, app-id y provider-subject; correo puede faltar | state invalid, provider ID suplantado, autorización denegada, email no verificado |
| TOTP MFA | enrolamiento + confirmación y recovery codes one-time | códigos inválidos/reusados, cambio reloj ventana, disable/recovery step-up |
| Session | cookies HttpOnly Secure, rotación refresh o sesión opaca server-side, CSRF y revocación | reuse detection, simultaneous refresh, expired, logout all, subdomain/cookie scope |
| API keys | token aleatorio fuerte, almacenar sólo hash/HMAC apropiado; prefix público y secreto 1 vez | revoke, expiry, scope, leak en logs, rotate overlap controlado |

**Elección inicial recomendada:** sesión opaca server-side con ID aleatorio y rotación/revocación en DB + caché segura (más simple de operar que refresh JWT complejos para web); si el proyecto elige refresh token rotatorio, registrar ADR y aplicar reuse detection. No usar localStorage para bearer de sesión o credenciales de API. OAuth y OTP son opciones **configurables**, no requisitos de conectividad para instalación totalmente local.

## Ownership de archivos (backend)

```text
src/modules/identity/
├── domain/schemas/user.schema.ts                        # usuario, estado/verificación
├── domain/schemas/otp-challenge.schema.ts               # challenge y consumo
├── domain/policies/login-risk.policy.ts                 # throttling y step-up
├── domain/policies/social-account-link.policy.ts       # vinculación por subject
├── application/ports/identity-provider.port.ts          # frontera OAuth
├── application/ports/otp.repository.port.ts             # consumo atómico
├── application/services/register-account.service.ts    # registro y verificación
├── application/services/request-email-otp.service.ts    # anti-enumeración + envío
├── application/services/verify-email-otp.service.ts     # single-use transaccional
├── application/services/begin-oauth-login.service.ts    # state, nonce, PKCE
├── application/services/complete-oauth-login.service.ts # callback seguro
├── application/services/revoke-session.service.ts      # revocación inmediata
├── infrastructure/oauth/google-oidc.adapter.ts         # Google
├── infrastructure/oauth/facebook-oauth.adapter.ts      # Facebook
├── infrastructure/persistence/drizzle/schema.ts        # constraints
└── presentation/http/controllers/identity.controller.ts # endpoints delgados
```

La lista exacta para **cada operación** de identidad y cada DTO está en `blueprint/02-matriz-endpoints.csv`; el árbol completo en `blueprint/01-arbol-de-archivos-comentado.md`.

## Invariantes del registro y sesión

1. No enumerar si correo/usuario existe; challenge y recuperación responden de forma genérica, con rate limit por IP/identidad/tenant y defensa de entrega abusiva.
2. Email y provider subject normalizados; unicidad de `(provider, provider_subject)` y correo según política; email confirmado no autoriza account linking automático a otro subject.
3. OTP: código de alta entropía suficiente, TTL breve definido por configuración, intentos limitados, almacenamiento hash y valor mostrado fuera de logs; consumo **atómico** y eliminación/revocación de challenges previos según política.
4. `state`, `nonce`, PKCE y callback URL vinculados a transacción, con validación exacta y anti-replay; nunca permitir redirect arbitrario (`return_to` allowlisted, paths relativos).
5. MFA recomendado obligatorio para admins globales; enrollment, disable, regeneración de recovery codes, credenciales críticas y API key requieren sesión fresca/step-up.
6. Cambio de contraseña/roles o compromiso revoca sesiones o incrementa `permissions_version`; cache autorizaciones se invalida.
7. Protección CSRF en mutaciones cookie; `SameSite` se elige junto con OAuth callback, `state`, política de dominios y defensa contra login CSRF.
8. No aceptar token de sesión web como API key máquina ni viceversa; formatos, scopes y guards distintos.

## Matriz de autorización

- **Instance:** `instance_owner`, `instance_admin`, `instance_operator`, `instance_auditor`; GPU global, políticas, backups, actualizaciones y configuración.
- **Organization:** `org_owner`, `org_admin`, `operator`, `developer`, `analyst`, `auditor`, `viewer`; miembros, claves, modelos, cuotas, experimentos, uso.
- **Resource:** el permiso funcional **no sustituye** pertenencia del recurso, habilitación de modelo, estado de organización, nivel de clasificación ni restricción de despliegue.
- **Un actor con dos orgs:** selecciona org activa solo en UI; cada URL `organization_id` se comprueba server-side, y las rutas por ID (`/models/:id`) resuelven `resource.organization_id` antes de leer/devolver campos.
- **Último owner:** no se puede abandonar/eliminar/rebajar último `org_owner`; prohibir escalación por `PATCH /members/:id` con SQL transaccional.
- **Caches:** claves con scope/version de permisos, invalidación tras revocación, tests de stale read y aislamiento.

## Páginas de identidad

`/login`, `/register`, `/password/forgot`, `/password/reset`, `/login/otp`, `/mfa/challenge`, `/invite/accept` (la verificación de email se resuelve por callback/API y su estado en la vista de auth), `/account/security`, `/account/sessions`, `/account/connections`. La matriz de páginas es la fuente exacta para confirmar rutas declaradas; si esta lista descriptiva difiere, prevalece `blueprint/03-matriz-paginas.csv` y se actualiza el resumen.

Cada página debe contemplar `idle/loading/invalid/expired/rate-limited/provider unavailable/success` y mensajes genéricos que no revelen existencia del usuario. Todos los formularios tienen labels reales, errores asociados, focus visible, input `autocomplete` apropiado, copiado OTP accesible y anuncios de status sin interrumpir lector de pantalla.

## E2E y BDD de seguridad

- `Given` usuario sin verificación de email `When` intenta función protegida `Then` denegar o pedir verificación según política.
- `Given` challenge OTP usado `When` llegan dos verificaciones paralelas `Then` exactamente una tiene éxito y ninguna crea sesión adicional.
- `Given` provider subject A `When` se hace callback con subject B y mismo email no confirmado `Then` no se fusionan cuentas.
- `Given` usuario en org A `When` solicita objeto de org B `Then` 403/404 sin metadatos de B y sin side effect.
- `Given` usuario perdió rol `When` reusa cache/sesión `Then` permisos reducidos se aplican en la siguiente solicitud según SLA documentado.
- `Given` admin sin step-up reciente `When` intenta rotar key o restaurar backup `Then` petición rechazada y auditada.

## Límites operativos

OAuth exige configuración de client ID/secret y callback HTTPS por proveedor; Google/Facebook no se garantizan offline. Email OTP requiere SMTP funcional (Mailpit solo en pruebas). El sistema debe ofrecer bootstrap de primer owner con token temporal de un solo uso en consola local y sin contraseña default. Política de registro/invitaciones y retención de sesiones es decisión del administrador; documentar los defaults y sus tradeoffs antes de publicar.
