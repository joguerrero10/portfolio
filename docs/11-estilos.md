# Estilos y contrato CSS

## Organización

```text
src/styles.scss               ← único estilo global declarado en angular.json
  ├── @use styles/fonts        ← @font-face de Manrope e IBM Plex Mono
  ├── @use styles/tokens       ← variables CSS en :root
  └── @use styles/foundation   ← reset, tipografía base, foco, utilidades de texto

src/app/**/<componente>.scss  ← estilos encapsulados de cada componente
```

Los estilos de componente usan la encapsulación por defecto de Angular (emulada), así que una clase `.timeline` en `experience.page.scss` no afecta a nada fuera de esa página.

## Tokens (`src/styles/_tokens.scss`)

Todo el diseño se apoya en variables CSS. No hay colores ni tamaños sueltos en los componentes.

| Grupo      | Variables                                                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color      | `--color-canvas`, `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-accent-hover`, `--color-accent-ink`, `--color-success`, `--color-error`, `--color-border`, `--color-control-border` |
| Tipografía | `--font-body` (Manrope), `--font-mono` (IBM Plex Mono), tamaños `--font-*-size`, alturas de línea `--line-body` y `--line-heading`                                                                                                 |
| Espaciado  | `--space-1` (0.25rem) a `--space-16` (4rem)                                                                                                                                                                                        |
| Forma      | `--border-width`, `--radius`, `--focus-width`, `--focus-offset`                                                                                                                                                                    |
| Layout     | `--control-size` (2.75rem, área táctil mínima), `--frame-size` (90rem), `--sidebar-size` (13.5rem)                                                                                                                                 |
| Movimiento | `--duration-color` (160ms)                                                                                                                                                                                                         |

La paleta es oscura: fondo "espresso" (`#181714` / `#201e1a`), texto crema (`#eeeae2`) y acento ámbar (`#d6ad70`). El sitio solo tiene tema oscuro; `index.html` lo declara con `color-scheme: dark`.

Los tamaños de título crecen en dos puntos de corte (`64em` y `80em`) redefiniendo las variables. Los componentes no necesitan saber nada de eso.

## Fuentes

Se sirven desde `public/assets/fonts/` con sus licencias. No se usa Google Fonts: no hay petición a terceros, no hay cookies de terceros y la fuente llega desde el mismo dominio y CDN.

- **Manrope** variable (pesos 200 a 800) en un único archivo woff2 con subconjunto latino. Precargada desde `index.html`.
- **IBM Plex Mono** 400 y 500. Se usa en eyebrows, rol y lema.

Todas con `font-display: swap`.

## Base (`src/styles/_foundation.scss`)

- `box-sizing: border-box` universal y márgenes a cero en encabezados, párrafos y listas.
- `router-outlet` y `[hidden]` con `display: none !important`. Lo primero evita que el elemento vacío `<router-outlet>` ocupe una celda en los layouts de grid.
- `overflow-wrap: anywhere` en textos y enlaces, para que un correo o una URL larga no rompa el layout en móvil.
- `:focus-visible` con contorno ámbar. Nunca se quita el indicador de foco.
- `prefers-reduced-motion: reduce` desactiva animaciones y transiciones.
- Clases compartidas: `.eyebrow`, `.brand-name`, `.brand-role`, `.footer-motto`.

## El contrato CSS

Esta es la parte menos habitual del proyecto y la que más sorprende la primera vez. Hay un conjunto de reglas que el CI no deja saltarse:

### 1. Solo unidades relativas

Unidades permitidas: `rem`, `em`, `fr`, `s`, `ms`, `deg`. Nada de `px`, `%`, `vw`, `vh`. Tampoco en media queries ni dentro de variables.

Motivo: si alguien configura el navegador con una fuente base de 20px, todo el diseño escala proporcionalmente. Con `px` mezclados, unas partes crecerían y otras no. Las media queries en `em` además responden al zoom del usuario.

### 2. Sin posicionamiento

Están prohibidas `position`, `top/right/bottom/left`, `inset*`, `float`, `z-index`, `transform`, `translate`, `offset*`, `grid-area`, `grid-row*` y `order`. Tampoco márgenes negativos ni `calc()`/`min()`/`max()`/`clamp()` en márgenes.

Motivo: el layout se construye solo con flujo, grid y flex. El orden visual coincide siempre con el orden del DOM, que es el que siguen el teclado y los lectores de pantalla. Y no aparecen elementos superpuestos que tapen contenido al hacer zoom.

### 3. Reglas finas sobre cada unidad

La regla propia `portfolio/rem-flow` (`tools/styles/rem-flow-rule.mjs`) añade matices:

- `fr` solo en `grid-template-columns/rows` y similares.
- `s` y `ms` solo en `transition`/`animation` o en variables cuyo nombre incluya `duration` o `delay`.
- `deg` solo en propiedades que describen ángulos.
- Longitudes distintas de cero sin unidad (por ejemplo `padding: 12`) están prohibidas.
- Sigue las referencias `var(--x)` y `$x` para comprobar también el valor de la variable.

### 4. Estilos estáticos y separados

`tools/styles/check-styles.mjs` recorre `src/` y rechaza:

- Componentes sin `templateUrl: './<nombre>.html'` y `styleUrl: './<nombre>.scss'` apuntando a su propia carpeta.
- `template`, `styles` o `styleUrls` inline.
- Bindings dinámicos de estilo en plantillas (`[style.x]`, `[ngStyle]`) o en el `host`.
- Atributos `style="…"` que incumplan las reglas anteriores.

La idea es que todo el CSS se pueda analizar de forma estática. Un `[style.width.px]` escaparía a Stylelint.

### Excepciones

`stylelint.config.mjs` define tres, cada una limitada a un archivo:

| Archivo                                           | Qué se permite                            | Por qué                                                      |
| ------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `features/home/hero/hero.scss`                    | `%`, `position`, `z-index`, `grid-row`    | Composición del texto sobre la ilustración del hero.         |
| `layout/sidebar-nav/sidebar-nav.scss`             | `%`, `position` e `inset-*` lógicos       | Hitos "Plan · Construir · Escalar" sobre la montaña.         |
| `layout/language-switcher/language-switcher.scss` | `position`, `z-index` e `inset-*` lógicos | El desplegable de idiomas en móvil flota sobre el contenido. |

Si necesitas otra excepción, añádela en `overrides` con el archivo concreto y el mínimo de propiedades. No la amplíes a una carpeta entera.

## Presupuestos

`angular.json` avisa si el SCSS compilado de un componente pasa de 4 kB y falla a partir de 8 kB. Es una forma de detectar componentes que están haciendo demasiadas cosas.

## Comandos

```bash
npm run lint:styles    # Stylelint sobre src/**/*.{scss,css}
npm run check:styles   # Stylelint + verificación de plantillas y decoradores
npm run test:styles    # casos válidos e inválidos del contrato (node:test)
```
