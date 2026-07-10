# Inferra S+ — Blueprint sincronizado

**Estado:** documentación de diseño, no software implementado. Fecha: 2026-11-08.

**Fuentes de verdad:** el CSV de endpoints contiene 163 rutas; el de frontend contiene 71 páginas; la proyección de 1632 **archivos planeados** en cinco repositorios y coordinador incluye comentario `#` por archivo. Las fases M1/M2/M3/S+ impiden crear todo como scaffolding vacío desde el inicio.

## Contenido

- `01-arbol-de-archivos-comentado.md`: inventario de **todos** los archivos propuestos, uno por línea y `#` explicativo.
- `02-matriz-endpoints.csv`: cada API con método, path, operación, módulo, controller, DTO, service, scopes, frontend y tests.
- `03-matriz-paginas.csv`: cada URL con componente, feature, acceso y pruebas.
- `04-plan-tests-y-devsecops.md`: unit/integration/API/BDD/browser/load/GPU, cobertura, Biome y seguridad.
- `05-auditoria-y-correcciones.md`: qué estaba desalineado antes y cómo se corrige.
- `architecture-manifest.json`: trazabilidad estructurada; NO configuración ejecutable.
- `scripts/generate.py`: generador del diseño desde mapa de API y páginas.
- `scripts/validate_architecture.py`: auditoría estática que exige referencias 1:1 y cero rutas huérfanas.

## Regla de mantenimiento

No editar CSV/árbol a mano. Modificar primero el documento de APIs/rutas cuando haya acuerdo de producto y regenerar los artefactos. Al implementar, contrastar el `operationId` y el componente realmente registrados contra los manifiestos usando tests OpenAPI y route-registry.

## Límites explícitos

No se ejecutó NestJS, Biome, Playwright, Cucumber, Compose ni vLLM. Las cifras certifican **consistencia de documentación propuesta**, no cobertura efectiva. `architecture-manifest.json` no reemplaza OpenAPI generado desde backend ni route-registry real.
