# Estructura de carpetas

Este es el árbol del repositorio sin `node_modules`, `dist` ni cachés. Los comentarios dicen para qué sirve cada cosa.

```text
portfolio/
├── .github/workflows/
│   ├── firebase-hosting-merge.yml         # push a main → build y despliegue al canal "live"
│   └── firebase-hosting-pull-request.yml  # PR del mismo repo → build y canal de previsualización
├── content/                               # FUENTE DE VERDAD del contenido. Se edita aquí.
│   ├── profile.json                       # nombre, rol, correo, redes, CV, proyectos
│   ├── skills.json                        # grupos de habilidades (array de arrays)
│   ├── es.json / en.json / pt.json        # todos los textos de la interfaz por idioma
│   └── site.json                          # origen público del sitio (para canonical y sitemap)
├── public/                                # se copia tal cual a dist/portfolio/browser
│   ├── assets/
│   │   ├── cv/Joel_Guerrero_CV.pdf        # CV en español
│   │   ├── fonts/                         # Manrope e IBM Plex Mono (woff2 + licencias)
│   │   ├── images/                        # ilustraciones .webp y logos .svg de cloud
│   │   └── ASSET_MANIFEST.md              # origen de las imágenes y prompts de regeneración
│   ├── i18n/{es,en,pt}.json               # COPIA generada de content/*.json. No editar a mano.
│   └── index.html                         # placeholder de Firebase; el build lo reemplaza
├── src/
│   ├── index.html                         # documento base: metas por defecto y preload de la fuente
│   ├── main.ts                            # arranque en el navegador
│   ├── main.server.ts                     # arranque en Node durante el prerender
│   ├── styles.scss                        # punto de entrada de estilos globales
│   ├── styles/
│   │   ├── _tokens.scss                   # variables CSS: colores, tipografía, espaciado
│   │   ├── _fonts.scss                    # @font-face locales
│   │   └── _foundation.scss               # reset y estilos base de elementos HTML
│   ├── environments/                      # GENERADO por tools/env; ignorado por git
│   └── app/
│       ├── app.ts / app.html / app.scss   # componente raíz: solo un <router-outlet>
│       ├── app.config.ts                  # providers del navegador
│       ├── app.config.server.ts           # providers extra para el servidor
│       ├── app.routes.ts                  # tabla de rutas del cliente
│       ├── app.routes.server.ts           # modo de render por ruta y parámetros del prerender
│       ├── app.spec.ts                    # tests de navegación de punta a punta
│       ├── domain/                        # tipos y contratos; no importa nada de Angular
│       ├── data-access/                   # lectura y validación del contenido
│       ├── core/                          # servicios de aplicación y guards
│       ├── layout/                        # el marco que envuelve todas las páginas
│       ├── shared/ui/                     # componentes visuales reutilizables
│       └── features/                      # una carpeta por página
├── tools/                                 # scripts Node (ESM) que acompañan al build
│   ├── env/                               # genera src/environments desde variables de entorno
│   ├── i18n/                              # valida y sincroniza traducciones; audita el HTML prerenderizado
│   ├── seo/                               # genera robots.txt y sitemap.xml
│   └── styles/                            # contrato CSS: regla propia de Stylelint y verificador
├── angular.json                           # configuración del CLI y del builder
├── tsconfig.json / .app / .spec           # TypeScript estricto
├── eslint.config.mjs                      # ESLint flat config
├── stylelint.config.mjs                   # Stylelint con el contrato de unidades y posicionamiento
├── firebase.json / .firebaserc            # hosting y proyecto de Firebase
├── .env.example                           # plantilla de variables locales
└── package.json                           # dependencias y scripts npm
```

## `src/app` en detalle

```text
src/app/
├── domain/
│   ├── locale.ts                  # LOCALES, Locale, DEFAULT_LOCALE, isLocale()
│   ├── portfolio.models.ts        # Profile, Project, Experience, SocialLink, ProjectStatus
│   ├── portfolio-copy.ts          # PortfolioCopy: forma exacta de content/es.json
│   ├── portfolio.repository.ts    # clase abstracta PortfolioRepository
│   └── site.ts                    # SiteConfig y resolveOrigin()
├── data-access/
│   ├── static-portfolio.repository.ts   # implementación basada en JSON importados
│   ├── profile.mapper.ts                # valida y normaliza profile.json
│   └── portfolio-translation.loader.ts  # TranslocoLoader que lee del repositorio
├── core/
│   ├── portfolio.facade.ts              # punto único de acceso a datos para la UI
│   ├── locale-context.ts                # idioma actual y textos, por instancia de layout
│   ├── language.service.ts              # carga traducciones y aplica el idioma al documento
│   ├── locale.guard.ts                  # valida :lang o redirige a /es conservando la ruta
│   ├── project.guard.ts                 # valida :slug o manda a /:lang/not-found
│   ├── localized-title.strategy.ts      # tras cada navegación: título, metas, SEO, progreso
│   ├── seo-tags.ts                      # canonical, hreflang y JSON-LD en <head>
│   ├── mission-progress.ts              # secciones visitadas, persistidas en localStorage
│   └── i18n.providers.ts                # provideTransloco + TitleStrategy
├── layout/
│   ├── locale-layout/        # componente de la ruta :lang; provee LocaleContext
│   ├── app-shell/            # skip link, header, menú móvil, sidebar, <main>, footer
│   ├── header/               # marca, selector de idioma, botón de menú
│   ├── language-switcher/    # desplegable ES/EN/PT que conserva la ruta
│   ├── navigation-links/     # lista de enlaces de navegación (vertical o en barra)
│   ├── sidebar-nav/          # navegación lateral de escritorio con lema e ilustración
│   ├── mobile-menu/          # panel de navegación desplegable en móvil
│   └── footer/               # identidad, redes, lema
├── shared/ui/
│   ├── button/               # atributo appButton sobre <a> o <button>
│   ├── icon/                 # envoltorio de ng-icons con el set de Feather registrado
│   ├── section-heading/      # eyebrow + h1/h2 + descripción
│   ├── feature-intro/        # cabecera estándar de página (SectionHeading con nivel 1)
│   ├── project-card/         # tarjeta de proyecto enlazada al detalle
│   ├── featured-missions/    # lista de proyectos destacados con enlace "ver todos"
│   └── inline-feedback/      # mensaje info/error/éxito (hoy sin uso)
└── features/
    ├── home/                 # home.page + hero/ + tech-row/
    ├── experience/
    ├── projects/             # projects.page + project-detail/
    ├── skills/               # skills.page + terminal/
    ├── recruiter/
    ├── contact/
    └── not-found/
```

## Convención de nombres

- Componentes de página: `nombre.page.ts` con clase `NombrePage` (por ejemplo `ExperiencePage`).
- Componentes normales: `nombre.ts` con clase `Nombre` sin sufijo `Component` (por ejemplo `Header`, `ProjectCard`). Es el estilo que genera el CLI desde Angular 20.
- Selectores con prefijo `app-` (definido en `angular.json`), salvo `Button`, que es un selector de atributo: `a[appButton], button[appButton]`.
- Tests junto al archivo que prueban: `nombre.spec.ts` para Vitest y `nombre.test.mjs` para los scripts de `tools/`.

## Lo que no está en git (y por qué)

`.gitignore` excluye `/src/environments/environment*.ts` y `.env`. Los archivos de entorno se generan en cada `npm start`, `npm test`, `npm run typecheck` y `npm run build` para que la configuración de Firebase nunca quede en el historial. Ver [Entorno y despliegue](14-despliegue.md).

`.gitignore` también excluye `/dist` y `/node_modules`, pero **ambas carpetas aparecen versionadas** porque se añadieron antes de la regla. Está anotado en [Deuda técnica](16-deuda-tecnica.md).
