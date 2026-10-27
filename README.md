# KORALL TEAM

Concepto de una plataforma de coordinación para Korall Global Holding: una iniciativa nacida en Vancouver, EE. UU., con una red internacional de afiliados gaming y afiliados físicos de microfútbol en Colombia y Brasil.

La sede, los frentes y las coordinaciones que aparecen en la interfaz son una narrativa de marca y datos demostrativos. No representan cifras, entidades jurídicas, alianzas ni operaciones verificadas. Confirmar nombres, ubicaciones, estructura y actividad antes de publicar como información factual.

## Aplicación

La experiencia web vive en [`korall-web/`](korall-web/), construida con React, TypeScript, Vite y Lucide. Incluye una vista responsive, búsqueda y filtros, creación de coordinaciones con responsable, fecha objetivo y notas, detalle de cada registro y actualización de estado. Los datos se guardan en `localStorage` del navegador actual: no se comparten ni sincronizan entre personas y siguen siendo demostrativos.

```bash
cd korall-web
npm install
npm run dev
```

Comprobaciones disponibles:

```bash
npm run lint
npm test
npm run build
```

## Modelo de desarrollo KORAL

- **K — Keep the brief honest:** el coordinador mantiene requisitos confirmados, hipótesis e incógnitas separados; ninguna hipótesis se presenta como un hecho.
- **O — Orient around users:** definir usuarios, decisiones y escenarios operativos antes de convertirlos en funcionalidad.
- **R — Render the system:** diseñar flujos, arquitectura y lenguaje visual desde los requisitos confirmados; etiquetar lo provisional.
- **A — Assemble in vertical slices:** entregar capacidades completas, accesibles y verificables en iteraciones pequeñas.
- **L — Look back and learn:** revisar la entrega contra criterios, recoger feedback y actualizar decisiones y riesgos.

El coordinador técnico asigna estas etapas a agentes de análisis, producto, diseño, implementación y calidad. Las decisiones de negocio, acciones destructivas y datos reales requieren validación humana. Si falta un objetivo operativo, el equipo propone preguntas o prototipos identificados como tales en lugar de inventar requisitos.