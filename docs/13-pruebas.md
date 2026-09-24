# Pruebas y calidad

Hay dos familias de tests que se ejecutan con herramientas distintas:

| Familia             | Dónde                 | Motor                        | Comando                                                    |
| ------------------- | --------------------- | ---------------------------- | ---------------------------------------------------------- |
| Aplicación Angular  | `src/**/*.spec.ts`    | Vitest + jsdom vía `ng test` | `npm test`                                                 |
| Scripts de `tools/` | `tools/**/*.test.mjs` | `node:test` nativo           | `npm run test:env`, `test:i18n`, `test:seo`, `test:styles` |

Y una auditoría sobre el resultado del build: `npm run check:prerender`.

## Tests de la aplicación

Son, en su mayoría, tests de integración: arrancan la aplicación con el router real, navegan a una URL con `RouterTestingHarness` y comprueban el DOM resultante. Casi no hay mocks; el repositorio real se usa con el contenido real.

| Archivo                                           | Qué cubre                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.spec.ts`                                     | Redirección de la raíz, las 18 combinaciones idioma × sección, detalle de proyectos, normalización de idioma inválido conservando query y fragmento, skip link, reutilización de la ruta al cambiar idioma, enlace activo, menú móvil (abrir, navegar, cerrar, foco), cierre del menú al cambiar idioma, redes pendientes, landmark de la barra lateral, 404 y slug desconocido. |
| `core/i18n.spec.ts`                               | Carga determinista de cada idioma, prioridad de la URL sobre `localStorage`, conservación de slug, matrix params, query y fragmento en ES → EN → PT, que el servidor no toque `localStorage`, que funcione con el almacenamiento bloqueado y que el loader rechace idiomas no soportados.                                                                                        |
| `core/seo.spec.ts`                                | Canonical y hreflang con origen, ausencia sin origen y JSON-LD con datos confirmados.                                                                                                                                                                                                                                                                                            |
| `data-access/static-portfolio.repository.spec.ts` | El mapper conserva los datos, rechaza enlaces inseguros, path traversal, estados inválidos, slugs duplicados, idioma de CV no soportado y tamaños irreales; la experiencia se valida y la fachada usa el repositorio inyectado.                                                                                                                                                  |
| `features/contact/contact.page.spec.ts`           | Correo, redes y CV reales por idioma; CV presente en inicio, reclutador y contacto; redes pendientes sin enlaces falsos.                                                                                                                                                                                                                                                         |
| `features/experience/experience.page.spec.ts`     | Trayectoria por idioma y estado vacío.                                                                                                                                                                                                                                                                                                                                           |
| `features/home/home.page.spec.ts`                 | Hero, tecnologías y misiones por idioma; que ningún enlace esté vacío o sea `#`; estado vacío; error si una tecnología clave desaparece de `skills.json`.                                                                                                                                                                                                                        |
| `features/projects/projects.page.spec.ts`         | Listado y estado; detalle de SmartPOS y SmartFinance; textos traducidos; navegación entre casos; slug desconocido.                                                                                                                                                                                                                                                               |
| `features/recruiter/recruiter.page.spec.ts`       | Resumen completo por idioma y que no se prometan certificaciones, métricas ni estudios terminados.                                                                                                                                                                                                                                                                               |
| `features/skills/skills.page.spec.ts`             | Grupos como chips sin niveles inventados, progreso que nunca bloquea, almacenamiento no disponible, comandos de la terminal y cambio de idioma del historial.                                                                                                                                                                                                                    |

Muchos tests están dentro de bucles `for (const locale of LOCALES)`, así que un solo `it` genera tres casos. En total son 95 tests en 10 archivos.

### Convenciones al escribir tests

- Configura el `TestBed` igual que `app.config.ts`: `providePortfolioI18n()`, `provideRouter(routes, withComponentInputBinding())` y el provider del repositorio.
- Para simular contenido distinto, espía el repositorio con `vi.spyOn(repository, 'getProfile').mockReturnValue(…)` en lugar de crear uno falso.
- Usa selectores semánticos (`h1`, `a[download]`, `[aria-current="page"]`) antes que clases CSS cuando sea posible.
- `describe`, `it`, `expect` y `vi` son globales gracias a `vitest/globals` en `tsconfig.spec.json`.

## Estado actual de la suite

Ejecutado el 23 de septiembre de 2026 sobre el commit `a57362a7`:

| Comprobación          | Resultado                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run typecheck`   | OK                                                                                                    |
| `npm run lint`        | OK                                                                                                    |
| `npm run test:env`    | 5 / 5                                                                                                 |
| `npm run test:i18n`   | 7 / 7                                                                                                 |
| `npm run test:seo`    | 6 / 6                                                                                                 |
| `npm run test:styles` | 24 / 24                                                                                               |
| `npm test`            | **92 / 95**. Fallan los tres casos _opens the {es,en,pt} SmartFinance case with its confirmed links_. |
| `npm run check:i18n`  | **Falla**: `Stale public/i18n/es.json; run npm run sync:i18n`.                                        |

Causa de los dos fallos:

- El test de SmartFinance espera que la página de detalle **no** tenga sección de arquitectura. Después se añadieron `technologies` y `architecture` a SmartFinance en `profile.json`, así que ahora la sección aparece. El test quedó desactualizado respecto al contenido.
- `content/es.json` se editó sin volver a ejecutar `npm run sync:i18n`. El `prebuild` lo sincroniza, así que el build no se ve afectado, pero el check aislado sí falla.

Ambos están recogidos en [Deuda técnica](16-deuda-tecnica.md).

## Orden recomendado antes de abrir un PR

```bash
npm run format:check
npm run typecheck
npm run lint
npm run check:styles
npm run sync:i18n && npm run check:i18n
npm test
npm run test:env && npm run test:i18n && npm run test:seo && npm run test:styles
npm run build
npm run check:prerender
```

Los workflows de GitHub solo ejecutan `npm ci` y `npm run build`. Todo lo demás depende de que se ejecute en local.
