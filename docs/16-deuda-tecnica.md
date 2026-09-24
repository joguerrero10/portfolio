# Deuda técnica y pendientes

Lo que sigue salió de revisar el código al escribir esta documentación (23 de septiembre de 2026, commit `a57362a7`). Está ordenado de más a menos urgente. Nada de esto se ha corregido: este documento solo lo describe.

## Prioridad alta

### 1. `node_modules/` y `dist/` están versionados

`.gitignore` los excluye, pero se añadieron al repositorio antes de esa regla y git los sigue rastreando: unos 24.900 archivos. Cada `npm install` o `npm run build` genera cambios enormes en `git status`, el repositorio pesa mucho más de lo necesario y los PR pueden arrastrar cambios de dependencias sin querer.

**Solución propuesta:** `git rm -r --cached node_modules dist` y commit. No borra nada del disco, solo deja de rastrearlos.

### 2. El CI despliega sin ejecutar tests

Los workflows solo hacen `npm ci` y `npm run build`. Un test roto, un error de lint o una página prerenderizada incorrecta llegan a producción si compila. De hecho, ahora mismo hay 3 tests fallando (punto 3) y el sitio se desplegaría igual.

**Solución propuesta:** añadir antes del despliegue `npm run typecheck`, `npm run lint`, `npm run check:styles`, `npm test` y, después del build, `npm run check:prerender`.

### 3. Tres tests fallan en `projects.page.spec.ts`

_opens the {es,en,pt} SmartFinance case with its confirmed links_ espera que SmartFinance no tenga sección de arquitectura. `profile.json` ya incluye `technologies` y `architecture` para ese proyecto, así que la sección aparece correctamente. El test está desactualizado respecto al contenido; hay que actualizar la expectativa.

### 4. `public/i18n/es.json` desactualizado

`npm run check:i18n` falla. El `prebuild` lo sincroniza, así que el build funciona, pero el check aislado no. Basta con `npm run sync:i18n` y hacer commit del resultado.

## Prioridad media

### 5. Las URL inexistentes no llegan a la página 404

La reescritura `** → /index.html` de `firebase.json` entrega la página de redirección de la raíz, así que `/cualquier-cosa` acaba en `/es`. Además, dentro de Angular, `/xx` se trata como idioma inválido y también redirige a `/es`. Solo `/es/xxx` muestra el 404. Los buscadores reciben un 200 con redirección donde deberían recibir un 404.

**Solución propuesta:** en `firebase.json`, sustituir la reescritura global por una a `/es/not-found/index.html` o usar la página `404.html` que Firebase sirve con código 404.

### 6. SDK de Firebase y archivos de entorno sin usar

`firebase` es una dependencia de producción y el build exige siete variables, pero ningún archivo de `src/` los importa. Si no hay planes cercanos, conviene quitar la dependencia y el `--require` del `prebuild`. Si los hay, documentar para qué.

### 7. Lógica por `id` de proyecto repetida en tres sitios

`ProjectCard`, `ProjectDetailPage` y `LocalizedTitleStrategy` repiten `if (project.id === 'smartfinance') … else if (project.id === 'smartpos') …` para elegir textos traducidos (categoría, resumen, descripción, rol, decisiones). Añadir un tercer proyecto obliga a tocar los tres archivos y los JSON de idioma.

**Solución propuesta:** mover los textos traducidos de cada proyecto a los JSON de idioma bajo una clave por `id` (por ejemplo `projects.smartfinance.summary`) y resolverlos en un único método de la fachada.

### 8. `format:check` referencia archivos que no existen

El script incluye `AGENTS.md` y `design-qa.md`, que no están en el repositorio, y Prettier falla con `No files matching the pattern were found`. Aparte de eso, en el commit revisado Prettier encuentra 102 archivos con problemas de formato (código, contenido y configuración). Hay que quitar las dos rutas del script y ejecutar `npx prettier --write` sobre el resto en un commit separado, sin otros cambios, para que la revisión sea fácil.

### 9. `resolveOrigin` duplicado

Idéntico en `src/app/domain/site.ts` y `tools/seo/sitemap.mjs`. Si uno cambia y el otro no, el canonical de las páginas y el sitemap podrían apuntar a dominios distintos. Se podría añadir un test que compare ambos resultados para los mismos valores de entrada.

## Prioridad baja

### 10. `InlineFeedback` no se usa

Componente completo en `shared/ui/inline-feedback` sin ninguna referencia. Lo mismo ocurre con las claves `form.*` de los textos. Parece preparación para un formulario de contacto. Si no está planificado, eliminarlo.

### 11. `public/index.html` es el placeholder de Firebase

Es la página "Firebase Hosting Setup Complete" que crea `firebase init`. No se ve porque el prerender de la raíz la sobrescribe en `dist`, pero confunde y carga scripts del SDK si alguna vez se sirviera. Se puede borrar.

### 12. Falta `favicon.ico`

`src/index.html` lo referencia y no existe en `public/`. Cada visita genera una petición 404.

### 13. Hitos de la barra lateral sin traducir

"Plan · Construir · Escalar" en `sidebar-nav.html` está en español fijo. Es decorativo y lleva `aria-hidden`, pero en las páginas en inglés y portugués se ve en español.

### 14. Referencias obsoletas

- `stylelint.config.mjs` ignora `kit-angular-firebase/**`, carpeta que ya no existe.
- `public/assets/ASSET_MANIFEST.md` dice que el hero usa `command-room.webp`, pero `hero.html` usa `banner-desktop.webp` y `mobile-banner.webp`. También menciona rutas `../design/` que no existen.
- `portafolio_diseño.png` (1,8 MB) en la raíz del repositorio. Si es solo una referencia de diseño, podría vivir fuera del repositorio o en `docs/`.

### 15. Telemetría del CLI activada

`angular.json` tiene `cli.analytics` con un identificador. Envía estadísticas de uso anónimas a Google al usar `ng`. Se desactiva con `ng analytics disable`.

### 16. Sin cabeceras HTTP en Hosting

`firebase.json` no define `headers`. Se podrían añadir cabeceras de caché largas para los archivos con hash, y cabeceras de seguridad (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`).
