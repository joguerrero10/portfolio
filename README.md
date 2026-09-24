# Joel Guerrero — Portafolio

Portafolio profesional en Angular, prerenderizado como sitio estático en español, inglés y portugués y publicado en Firebase Hosting.

Este archivo solo explica cómo instalarlo y compilarlo. La arquitectura, las decisiones técnicas y la descripción de cada parte están en [`docs/`](docs/README.md).

## Requisitos

- **Node.js** 22.22.3+, 24.15.0+ o 26+ (probado con 24.21.0).
- **npm** 12 (probado con 12.0.2).

```bash
node -v
npm -v
```

## Instalación

```bash
git clone https://github.com/joguerrero10/portfolio.git
cd portfolio
npm ci
```

Usa `npm ci` en lugar de `npm install` para instalar exactamente las versiones de `package-lock.json`.

## Variables de entorno

El build necesita la configuración web de Firebase. Copia la plantilla y rellénala:

```bash
cp .env.example .env
```

```dotenv
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=      # opcional
```

Los valores se obtienen en Firebase Console → Configuración del proyecto → Tus apps → Configuración del SDK. `.env` está en `.gitignore`: no lo subas.

Con esas variables se generan automáticamente `src/environments/environment.ts` y `environment.development.ts` antes de `start`, `test`, `typecheck` y `build`. En desarrollo, si falta alguna solo verás un aviso; el build de producción se detiene.

## Desarrollo

```bash
npm start
```

Abre <http://localhost:4200/es>. Los cambios se recargan solos.

## Compilación

```bash
npm run build
```

El resultado queda en `dist/portfolio/browser/`: un HTML por página e idioma, los assets, `robots.txt` y `sitemap.xml`.

Para revisar el HTML generado:

```bash
npm run check:prerender
```

Para servir el build en local:

```bash
npx http-server dist/portfolio/browser -p 8080
```

## Comprobaciones

```bash
npm run typecheck
npm run lint
npm run check:styles
npm test
```

La lista completa de scripts y qué hace cada uno está en [docs/12-herramientas.md](docs/12-herramientas.md).
