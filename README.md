# Joel Guerrero — Arquitectura para misiones reales

Portafolio Angular con salida estática prevista para Firebase Hosting. Las fases 01 a 04 aportan rutas lazy ES/EN/PT, contenido tipado, el shell responsive espresso/ámbar con fuentes locales, la internacionalización completa con Transloco y la portada compuesta con hero, tecnologías y misiones destacadas. Las demás pantallas se implementan en las siguientes fases del kit.

## Desarrollo

Node probado: **24.21.0**. npm: **12.0.2**. Versiones y compatibilidad en [docs/stack.md](docs/stack.md).

```bash
npm ci
npm start
```

Abrir `http://localhost:4200/es`. Las rutas públicas usan `/es`, `/en` o `/pt`, seguidas de `experience`, `projects`, `projects/:slug`, `skills`, `recruiter` o `contact`. Slugs reales: `smartfinance-pty`, `smartpos-pty`. Raíz redirige a español y un idioma no admitido se normaliza a español conservando sección, query y fragmento.

La URL decide el idioma: el selector solo reescribe su primer segmento, así que cambiarlo conserva la sección y el proyecto abierto. La preferencia se guarda en el navegador para información, nunca para sobrescribir la URL.

## Verificación

```bash
npm run typecheck
npm run lint
npm run lint:styles
npm run check:styles
npm run test:styles
npm run check:i18n
npm run test:i18n
npm run test:seo
npm run test:env
npm run format:check
npm test
npm run build
npm run check:prerender
```

`npm run check:prerender` se ejecuta después del build y analiza el HTML de las 27 páginas: idioma, títulos, metadatos, nota del CV, enlaces que conservan el idioma y ausencia de claves sin traducir. `npm run test:watch` conserva el modo interactivo. `check:styles` usa Stylelint, parsers CSS/SCSS, AST TypeScript y plantillas Angular. Comprueba unidades y flujo; también exige archivos HTML y SCSS separados por componente. `test:styles` prueba rechazos y casos válidos del contrato.

El build prerenderiza HTML y assets en `dist/portfolio/browser` y genera `robots.txt` —y `sitemap.xml` cuando hay dominio— en su paso `postbuild`. La auditoría de QA, accesibilidad y SEO está en [docs/qa.md](docs/qa.md).

## Variables de entorno y despliegue

`src/environments/environment.ts` y `environment.development.ts` no se versionan: `tools/env/generate-environment.mjs` los genera a partir de las variables `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID` y, opcional, `FIREBASE_MEASUREMENT_ID`.

- En local, copiar `.env.example` a `.env` y rellenarlo. `.env` está en `.gitignore`. `npm start`, `npm test` y `npm run typecheck` generan los archivos antes de ejecutarse y avisan si falta alguna variable.
- `npm run build` exige todas las obligatorias y falla si falta alguna.
- En GitHub Actions, los workflows de `.github/workflows` leen esas variables de los secrets del repositorio (Settings → Secrets and variables → Actions), junto con `FIREBASE_SERVICE_ACCOUNT_PORTFOLIO_1A3E7` para desplegar. Un push a `main` publica en el canal `live`; un pull request del propio repositorio publica un canal de previsualización.

La configuración web de Firebase acaba dentro del JavaScript público: los secrets la mantienen fuera del repositorio y de los logs, pero la protección real está en las restricciones de la API key en Google Cloud, las reglas de seguridad de Firebase y App Check.

## Contenido y estructura

- `src/app/domain`: modelos y contrato del repositorio.
- `src/app/data-access`: importación y validación del contenido local.
- `src/app/core`: fachada, contexto de idioma y guards.
- `src/app/layout`, `shared/ui`, `features`: shell en flujo, UI reutilizable y pantallas lazy. La portada se compone de `features/home/hero`, `tech-row` y `featured-missions`.
- `content`: fuente editable de perfil, habilidades y textos ES/EN/PT.
- `content/site.json`: origen público del sitio. Con `origin` o `firebaseProjectId` se emiten canonical, hreflang y `sitemap.xml`; vacíos, no se emite ninguno.
- `public/assets`: ilustraciones conceptuales WebP, Manrope e IBM Plex Mono con licencias y PDF español. Las imágenes se sirven con `img` nativo, medidas rem y `aspect-ratio`.
- `public/i18n`: copias de los diccionarios generadas con `npm run sync:i18n`. `prebuild` las sincroniza y valida antes de cada build; editar siempre `content`.
- `kit-angular-firebase`: contrato, prompts y referencias originales conservados.
- `docs/progress.md`: resultados y próxima fase; `docs/decisions.md`: decisiones y límites.

El CV, LinkedIn, GitHub, Instagram y los enlaces de SmartFinance son accesibles directamente desde `content/profile.json`. Los enlaces aún no suministrados, como la demo y el repositorio de SmartPOS, se mantienen nulos y se muestran como estado pendiente traducido. No hay login público ni contenido bloqueado por gamificación.

Cada componente se organiza en su propia carpeta con `.ts`, `.html` y `.scss`. El CLI tiene `inlineTemplate: false`, `inlineStyle: false` y `flat: false`. Las capturas y el alcance visual de las fases 02 y 04 están en [design-qa.md](design-qa.md).
