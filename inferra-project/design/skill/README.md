# Inferra SuperSkill — paquete de especificación, no repositorio de aplicación

Este paquete reúne una skill propuesta (`SKILL.md`), dieciséis documentos de referencia operativa, matrices de contrato, un árbol comentado de archivos, ejemplos BDD, plantillas de revisión y un validador estático. Define **qué construir y cómo demostrarlo**, no contiene software de producción ni una aplicación NestJS ejecutable.

## Uso

1. Instalar/copy **esta carpeta completa** en el directorio de skills que realmente utilice el agente/consumer, por ejemplo `.opencode/skills/inferra-super-senior/` cuando su entorno sea compatible. No asumir que por copiarla quedó detectada.
2. Añadir al `AGENTS.md` del proyecto un enlace a `SKILL.md`, asignar propietario y comprobar que el motor lee también las referencias locales.
3. Abrir primero `SKILL.md` + `references/00-mapa-y-fuentes.md`, luego las referencias según tarea. Consultar los ZIP originales de Vigilio para normas canónicas; esta skill enlaza sus rutas.
4. Ejecutar `python3 scripts/validate_super_skill.py` dentro de este paquete. Valida **consistencia documental**, no software real.
5. Para comenzar a implementar: seguir `references/11-roadmap-y-aceptacion.md` y construir sólo archivos de la primera fase que tengan responsabilidades reales.

## Autoridad y compatibilidad

- `blueprint/architecture-manifest.json`: proyección estructurada del diseño de **163 endpoints, 71 rutas y 1.632 archivos futuros**, basada en los blueprints previos del usuario.
- `blueprint/02-matriz-endpoints.csv`: método, ruta, operationId, owner, controller, DTO, service y suites planificadas.
- `blueprint/03-matriz-paginas.csv`: ruta, pantalla, control de acceso, consumidor API y pruebas.
- `blueprint/01-arbol-de-archivos-comentado.md`: inventario de archivos con comentarios `#`, **documental**.
- `references/*.md`: decisiones de alcance, responsabilidades, invariantes, contratos de UX/seguridad/plataforma y Definition of Done.

Las imágenes, hardware, registro OAuth, configuración de SMTP y almacenamiento externo no quedan instalados por el paquete. `PASS` en validación estructural no implica `PASS` en tests E2E, GPU, seguridad o recuperación.

## Restricción de despliegue

Solo Docker Compose self-hosted; sin AWS, Kubernetes, Terraform ni Podman. Ver `references/15-skills-seleccionadas-docker-compose.md` para inventario de skills originales (aplicables/excluidas) y rutas canónicas.
