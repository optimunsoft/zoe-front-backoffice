# core/ui — dónde editar qué

Mapa rápido para cambios de diseño/comportamiento. **No migrar tokens violet→brand** sin decisión de producto (cambia el look).

| Quiero cambiar… | Archivo |
|-----------------|---------|
| Look folder tabs | `tabs/UTabs.vue` (`<style scoped>`) |
| Variantes underline / simple / icons / container | `tabs/tabs.utils.ts` |
| Botones (variantes) | `buttons/button.utils.ts` + `.btn*` en CSS global Mosaic |
| Inputs size / state / disabled | `inputs/input.utils.ts` |
| Badge | `badge/badge.utils.ts` |
| Modal shell (size/motion) | `modal/ModalShell.vue` |
| Chrome header/footer ModalBasic | `modal/ModalBasic.vue` |
| Tooltip | `Utooltip/Tooltip.vue` |
| Tabla | `Tables/Utable.vue` |

## Notas

- Filtros de tablas: siguen pegando al **endpoint de filtro**; no sustituir por filtro solo en cliente.
- `UTabs` prop `keepAlivePanels` (default `true`): `false` desmonta paneles inactivos (p.ej. form empresa).
- Demos Mosaic (`dashboard/`, `settings/`) no son el design system canónico.
