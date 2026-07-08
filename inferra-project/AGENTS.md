# INFERЯA Engineering Rules
- Seguir los docs de `design/skill/SKILL.md` y el mapa de capacidades. No declarar `PASS` sin evidencia.
- Nunca AWS, Terraform, Kubernetes o runtime público de vLLM. Solo Linux + Docker Compose.
- Controller HTTP → DTO Zod → aplicación → puerto → adapter. RBAC y tenant en cada recurso.
- Se prohíbe montar socket Docker dentro de la API, registrar secretos/prompts, o usar datos de demo como producción.
- Toda modificación requiere tests unit, seguridad negativa, contrato y E2E según impacto; `biome`, TypeScript strict, OpenAPI coherente.
- **PROHIBICIÓN ESTRICTA DE EMOJIS COMO ICONOS:** Queda terminantemente prohibido usar emojis de texto (`🏢`, `🧠`, `🔑`, `🚀`, `⚡`, etc.) como iconos en la interfaz de usuario. Todo icono debe ser un componente SVG vectorial (`<svg aria-hidden="true">`), limpio, escalable, tematizable y consistente con el diseño enterprise.
- **ARQUITECTURA DE COMPONENTES FRONTEND:** Se prohíbe tener todo el código en `pages/` o concentrar todos los componentes en un archivo monolítico `components.tsx`. Cada feature (`features/<domain>/`) DEBE poseer su carpeta `components/` con componentes de dominio reutilizables (cards, forms, tables, dialogs, banners), dejando `pages/` como vistas orquestadoras del router.
