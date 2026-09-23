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
npm run format:check
npm test
npm run build
npm run check:prerender
```

`npm run check:prerender` se ejecuta después del build y analiza el HTML de las 27 páginas: idioma, títulos, metadatos, nota del CV, enlaces que conservan el idioma y ausencia de claves sin traducir. `npm run test:watch` conserva el modo interactivo. `check:styles` usa Stylelint, parsers CSS/SCSS, AST TypeScript y plantillas Angular. Comprueba unidades y flujo; también exige archivos HTML y SCSS separados por componente. `test:styles` prueba rechazos y casos válidos del contrato.

El build prerenderiza HTML y assets en `dist/portfolio/browser` y genera `robots.txt` —y `sitemap.xml` cuando hay dominio— en su paso `postbuild`. No necesita Firebase ni credenciales. No hay despliegue configurado todavía. La auditoría de QA, accesibilidad y SEO está en [docs/qa.md](docs/qa.md).

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
