# 05 — Frontend, páginas, UX/UI, interacción, accesibilidad

## Stack y convenciones

Preact 11 + Vite 8 + TypeScript estricto + Tailwind CSS 4 (referencias Vigilio, fijar parches en lockfile); TanStack Query para server state, React Hook Form + Zod para formularios según compatibilidad real con `@preact/compat`; Signals o estado local solo para UI efímera. Router elegido por compatibilidad real y ADR (wouter/TanStack Router según paquete instalado), no migrarlo por moda. Tablas: confirmar API instalada de TanStack Table; charts visuales nunca representan métricas inexistentes.

```text
src/
├── app/                         # Bootstrap, providers, router, guards, layouts, error boundaries
├── features/                    # Auth, onboarding, dashboard, models, deployments, playground…
│   └── {feature}/
│       ├── pages/               # Entradas de rutas; NO fetch directo
│       ├── components/          # Componentes de feature
│       ├── hooks/               # Comportamiento/queries locales
│       ├── services/            # API adaptador de feature
│       ├── types/               # Solo ViewModels frontend no derivados de DTO
│       └── {feature}.query-keys.ts
├── services/
│   ├── http/                    # Cliente, CSRF, errores/AbortSignal
│   ├── auth/                    # Sesión y refresh
│   ├── inference/               # SSE parser, cancellation y chunks
│   ├── runtime-config/          # config runtime no secreta
│   └── observability/           # RUM, traceparent, privacidad
├── libs/
│   ├── ui/                      # Componentes básicos agnósticos solo tras uso real
│   ├── charts/                  # Visualizaciones accesibles
│   └── accessibility/          # utilidades focus/announce
└── styles/                      # tokens, modes, global styles
```

## Navegación por tarea (no por tabla SQL)

**Pública:** login, registro, recuperación, OTP, MFA, OAuth callback/error, aceptar invitación, página de estado acceso. **Cuenta:** perfil, seguridad, sesiones, conexiones. **Onboarding:** bienvenida, organización, primer modelo/GPU. **Trabajo por org:** dashboard, Playground, Modelos/Imports, Deployments, API Keys, Usage/Quotas/Cost, Routing, Benchmarks/Experiments, Datasets/Artifacts, Equipo/Roles, Audit, Alerts/Notifications/Webhooks. **Instance Admin:** GPU Nodes, system health/settings, jobs, backup/restore, observabilidad. Navegación por ruta real de `blueprint/03-matriz-paginas.csv` (71 vistas) y permiso server-side.

### Componentes de aplicación

- **Shell global:** `AppShell`, `TopBar`, `Sidebar`, `OrgSwitcher`, `Breadcrumbs`, `ModelStatusBadge`, `GlobalSearch`, `NotificationsMenu`, `UserMenu`, `RouteErrorBoundary`.
- **Auth:** `LoginOptions`, `PasswordLoginForm`, `RegisterForm`, `OtpChallengeForm`, `SocialLoginButtons` (Google/Facebook con estado disabled si no configurado), `MfaCodeForm`, `RecoveryCodesDialog`, `SessionList`.
- **Playground:** `ConversationList`, `PromptComposer`, `ChatMessage`, `StreamingAnswer`, `ModelSelector`, `GenerationSettingsPanel`, `TokenCounter`, `AbortGenerationButton`, `ModelCompare`, `ErrorRecovery`.
- **Models:** `ModelTable`, `ModelCard`, `CompatibilityCheck`, `ModelManifestEditor`, `ModelImportWizard`, `LicenseConfirmation`, `DownloadStatus`.
- **Deploy:** `DeploymentWizard`, `GpuPreflight`, `RuntimeProfileSelector`, `DeploymentTimeline`, `RuntimeHealthStatus`, `DeploymentLogs`, `RollbackConfirmation`.
- **Benchmarks:** `WorkloadEditor`, `DatasetPicker`, `ConcurrencyConfig`, `RunProgress`, `TtftPercentileChart`, `GoodputChart`, `VramChart`, `ComparisonTable`, `ExperimentPromotionReview`.
- **Security/Admin:** `ApiKeyCreateDialog`, `ApiKeyOnceOnlyReveal`, `RoleMatrix`, `OrganizationMembers`, `AuditTable`, `BackupStatus`, `IncidentPanel`, `SystemReadiness`.

No convertir todo en componentes `libs/ui`: promover después de segunda reutilización y contrato visual estable. Componentes nunca autorizan una acción: el botón oculto no reemplaza el guard/Policy en backend.

### Regla Canónica de Iconografía y Descomposición de Componentes
1. **PROHIBICIÓN TOTAL DE EMOJIS COMO ICONOS:**
   - Queda estrictamente prohibido utilizar emojis de texto (tales como `🏢`, `🧠`, `🔑`, `🚀`, `⚡`, `🛡️`, `💻`, `🎯`, `🔍`) como reemplazo de iconos en la interfaz gráfica.
   - Todo icono debe ser un componente SVG vectorial (`<svg aria-hidden="true">`) limpio, responsivo y temáticamente integrado desde `libs/ui/icons.tsx`.
   - Propiedades obligatorias de los iconos SVG: `stroke="currentColor"`, `strokeWidth="1.75"` o `fill="currentColor"`, `viewBox="0 0 24 24"`, tamaño estandarizado (16px, 18px, 20px o 24px) y accesibilidad mediante `aria-hidden="true"` (con etiqueta de texto adyacente o `aria-label`).
2. **DESCOMPOSICIÓN MODULAR DE COMPONENTES POR FEATURE:**
   - Las carpetas `pages/` deben contener única y exclusivamente los orquestadores de ruta (recuperación de datos vía hooks, breadcrumbs y composición de alto nivel).
   - Todo bloque visual reutilizable o específico de dominio (tarjetas de pasos, banners de estado, modales de confirmación, tablas de listado, selectores, métricas) DEBE residir en `features/<dominio>/components/`.
   - Queda prohibido centralizar artificialmente todos los componentes en un único archivo monolítico (`components.tsx`). Cada componente de dominio debe tener su archivo dedicado dentro de la carpeta `components/` de su respectivo feature.

## Matriz de estados requerida por pantalla

| Estado | Comportamiento visible | Test |
|---|---|---|
| Loading | Skeleton con dimensiones y `aria-busy` cuando procede | componentes y accesibilidad |
| Empty | explicación, CTA con permiso y ejemplo si procede | MSW empty fixture |
| Success | confirmación y resultado persistido, sin toast falso | Playwright + API persistencia |
| Invalid | validación a nivel campo + resumen asociado | RHF/Zod unit y teclado |
| 401 | renovar sesión si permitido o ir login con destino seguro | API/web E2E |
| 403 | acceso restringido sin filtrar metadatos | route-access cross-role |
| 404 | objeto inexistente/no visible y vuelta contextual | route-access |
| 409/412 | conflicto de estado/edición, opción recuperar | unit/E2E conflict |
| 429 | rate limit/cooldown con `Retry-After` si contrato | fake clock + test |
| 503 | modelo/servicio no disponible, retry idempotente | upstream stub fail |
| Offline/degraded | mensaje persistente, sin prometer guardar request no enviado | browser offline test |
| Cancel | abort/cancel explícito y reconciliación de usage | streaming E2E |

## Diseño visual original, no plantilla genérica

**Dirección propuesta:** infraestructura profesional, alto contraste, información densa y legible, sin neones/gradientes que oculten estados. Lateral fijo en escritorio; navegación responsive en tablet/móvil; charts con escalas, unidades, sampling y descripciones. Modos claro/oscuro, high-contrast y reduced-motion. Design tokens jerárquicos `primitive → semantic → component → mode` con contraste comprobable; no duplicar hex en páginas. Colores de estado semánticos: éxito/alerta/fallo/desconocido, siempre con texto/icono y no solo color. Configuración de branding de instancia sin permitir CSS arbitrario/XSS.

**Componentes base:** button, link, field, checkbox, radio, select, combobox, data-table, dialog, popover, tooltip, toast, progress, tabs, disclosure, skeleton, chart-legend, copy-button, empty-state. Para cada uno: focus, hover, pressed, loading, disabled, error, sizes, responsive, teclado, screen reader.

## Flujos UX detallados

**Register:** elegir método → formulario/proveedor → feedback sin enumeración → verificar email/OTP → MFA cuando aplica → organización → información sobre recursos disponibles → primer modelo. Cancelar vuelve a inicio sin dejar permisos parciales. No auto-crear una org global por callback de OAuth.

**Login Google/Facebook:** botones distinguibles y auténticos; al elegir deshabilitar repetición, redirigir servidor a proveedor y volver a callback seguro; si falla permiso o provider, mensaje explícito, retry local, sin mostrar token o datos privados en URL.

**Login OTP:** ingresar correo → estado enviado genérico → código de dígitos, paste permitido, reenvío con cooldown, caducidad anunciada, intento agotado y recuperación. No hacer auto-submit antes de completar accesibilidad; bloquear doble click con server invariant.

**Playground:** seleccionar modelo elegible → ajustar parámetros dentro de límites → enviar → TTFT visible cuando fiable → streaming incremental y botón Stop → conteo token estimado/real diferenciado → guardado por política de privacidad → reintento seguro. No usar Markdown HTML sin sanitización.

**Deployment wizard:** seleccionar manifest/licencia → perfil allowlisted → chequeo GPU/VRAM/disk → revisión de impacto, exclusividad y costos → confirmación/step-up → job asincrónico → estados loading/failure/rollback y logs redactados. Los errores no ofrecen flags Docker manuales inseguros.

**Benchmark lab:** especificar modelo baseline y candidato → dataset/version/seed, potencia, warming/cold cache, concurrencia, ventana y límite de ejecución → progreso/resultado → comparación con intervalos/uncertainty y advertencias de comparabilidad.

## Performance, accesibilidad y localización

- Objetivo WCAG 2.2 AA web: teclado completo, foco visible, reflow 200 %, feedback con role/status, modales Escape/retorno foco, labels reales, errores asociados y contraste probado en modos; `axe` no reemplaza screen reader manual.
- Soporte `es` inicial; diseño preparado para `en` con diccionarios y fechas/números/tokens formatizados; no hardcodear moneda/costo de GPU como universal.
- Charts con resumen textual/tabular, leyendas, unidades y rangos; web con virtualization/paginación cuando data grande, sin poner ID high-cardinality en métricas frontend.
- Métricas web: errores de navegación, Web Vitals (con consentimiento/política), duration interacción principal; CSP, no scripts externos necesarios para renderizar login.
- Visual regression por páginas y modos de alto riesgo, revisiones humanas de screenshots, pruebas responsive móviles y Desktop en Chromium/Firefox/WebKit.

## Contratos browser-safe

Todos los request/response types los genera owner backend desde DTO Zod/OpenAPI, con paquete/artefacto versionado por release y check `openapi diff`. La app no importa NestJS, Drizzle, Node crypto, sockets privados ni secretos. `api-client` trata CSRF, cookies `credentials` y errores; otro cliente SDK demo puede aceptar una **clave de prueba efímera** sin persistirla en localStorage. Nunca replicar un guard en navegador como control de seguridad suficiente.
