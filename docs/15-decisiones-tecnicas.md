# Decisiones técnicas

Cada entrada explica qué se decidió, por qué y qué se sacrificó a cambio. Algunas decisiones están escritas explícitamente en el código o en notas del repositorio; otras se deducen de cómo está construido y de lo que comprueban los tests. En ese caso se indica.

---

## D1. Sitio estático prerenderizado en lugar de SPA o SSR en servidor

**Decisión.** `outputMode: "static"`. Todas las rutas se generan como HTML en el build. No hay servidor Node en producción.

**Por qué.** El contenido cambia pocas veces al año y es igual para todo el mundo. Prerenderizar da HTML completo para buscadores y para las vistas previas de LinkedIn o WhatsApp, un tiempo de primera carga mínimo y un hosting estático casi gratuito. Un SSR en servidor añadiría coste y operación sin ningún beneficio para este caso.

**A cambio.** Cualquier cambio de contenido exige un build y un despliegue. Aceptable, porque el contenido vive en el repositorio de todos modos.

---

## D2. Contenido en JSON dentro del repositorio, compilado en el bundle

**Decisión.** `content/*.json` se importa como módulo TypeScript. No hay CMS ni base de datos.

**Por qué.** El contenido pasa por code review, queda versionado junto al código que lo muestra y TypeScript valida su forma (`satisfies Record<Locale, PortfolioCopy>`). Además está disponible de forma síncrona durante el prerender, sin llamadas de red que puedan fallar.

**A cambio.** Editar el portafolio requiere tocar el repositorio. Los tres idiomas viajan en el bundle aunque se use uno.

---

## D3. Repositorio abstracto + fachada

**Decisión.** `PortfolioRepository` (abstracto, en `domain`) → `StaticPortfolioRepository` (en `data-access`) → `PortfolioFacade` (en `core`) → componentes.

**Por qué.** Los componentes no saben de dónde vienen los datos. Si el contenido se mueve a Firestore, se escribe otra implementación y se cambia una línea en `app.config.ts`. La fachada añade reglas de negocio pequeñas (tecnologías clave que deben existir en habilidades, redes en orden fijo) sin ensuciar el repositorio.

**A cambio.** Un nivel más de indirección para un proyecto pequeño. Y el contrato es síncrono: una fuente remota obligaría a cambiar las firmas a `Observable` o `Promise`, o a precargar los datos en un `APP_INITIALIZER` o en un resolver.

---

## D4. Idioma en la URL, nunca en el almacenamiento

**Decisión.** El primer segmento de la URL es el idioma. La preferencia guardada no se lee para decidir.

**Por qué.** Cada URL debe mostrar siempre lo mismo para que el HTML prerenderizado, lo indexado por Google y lo compartido coincidan. También simplifica: no hay estados en los que la URL diga una cosa y la pantalla otra.

**A cambio.** Quien entra por `/` ve español aunque su navegador esté en inglés. No hay detección automática.

---

## D5. Transloco con loader en memoria en lugar de `@angular/localize`

**Decisión.** Transloco en tiempo de ejecución con un loader que devuelve los JSON del bundle.

**Por qué (deducido).** `@angular/localize` genera un build separado por idioma y el cambio de idioma recarga la página. Con Transloco hay un solo build, el selector de idioma cambia sin recarga y la reutilización de componentes funciona. El loader en memoria evita peticiones y hace que el prerender salga traducido sin esperas.

**A cambio.** Las traducciones no se extraen automáticamente de las plantillas; hay que mantener las claves a mano en tres archivos. Los scripts de `tools/i18n` compensan con validación estricta.

---

## D6. Acceso tipado a textos con `context.copy()` en lugar del pipe

**Decisión.** Las plantillas usan `context.copy().clave` en vez de `{{ 'portfolio.clave' | transloco }}`.

**Por qué.** Con `strictTemplates`, una clave mal escrita es un error de compilación. Con el pipe, sería una cadena que falla en silencio en ejecución.

**A cambio.** Se pierde la interpolación de parámetros del pipe. Hoy ningún texto la necesita.

---

## D7. `TitleStrategy` como gancho central post-navegación

**Decisión.** `LocalizedTitleStrategy` no solo pone el título: confirma el idioma, registra el progreso y actualiza metas, canonical, hreflang y JSON-LD.

**Por qué.** El router garantiza que `updateTitle` se ejecuta una vez por navegación completada, también en el prerender y en el momento adecuado para que el HTML serializado lo incluya. Es el lugar más fiable para "hacer algo cuando la página cambia".

**A cambio.** El nombre de la clase se queda corto respecto a lo que hace. Si crece más, convendría que delegara en un servicio `PageLifecycle` o similar.

---

## D8. Contrato CSS estricto: solo `rem/em`, sin posicionamiento

**Decisión.** Stylelint con una regla propia prohíbe `px`, `%`, `vw`, `position`, `transform`, márgenes negativos y más, con tres excepciones puntuales.

**Por qué (deducido de las reglas y de los tests).** Accesibilidad y un layout que no se rompe. Todo escala con la fuente del usuario; el orden visual es el orden del DOM; nada se superpone al hacer zoom. Automatizarlo evita que la disciplina dependa de la memoria de cada persona.

**A cambio.** Algunos efectos visuales cuestan más o necesitan una excepción documentada. La curva de entrada es mayor.

---

## D9. Un componente, tres archivos, carpeta propia

**Decisión.** Prohibidas las plantillas y estilos inline. Verificado por `check-styles.mjs` y fijado en los schematics de `angular.json`.

**Por qué.** Estructura predecible y todo el CSS analizable de forma estática por el contrato de estilos (D8).

**A cambio.** Componentes triviales como `Button` o `LocaleLayout` tienen archivos de una línea.

---

## D10. Validación del contenido que rompe el build

**Decisión.** `mapProfile`, `getExperiences`, `PortfolioFacade.coreTechnologies` y `check-prerender` lanzan errores ante contenido incorrecto en vez de degradar con elegancia.

**Por qué.** Es un portafolio profesional: publicar un enlace roto, un tamaño de CV falso o una tecnología que no está en el perfil es peor que no publicar. Mejor que falle el build y alguien lo arregle.

**A cambio.** Un error en un JSON impide desplegar cualquier otro cambio hasta corregirlo.

---

## D11. Enlaces "pendientes" explícitos en lugar de ocultarlos

**Decisión.** Una red social o un enlace de demo sin confirmar es `null` y se muestra como "Enlace pendiente".

**Por qué.** Deja claro que el perfil existe o existirá, sin inventar una URL. Los tests comprueban que nunca se pinte `href="#"` ni un enlace vacío.

---

## D12. Fuentes locales en lugar de Google Fonts

**Decisión.** Manrope e IBM Plex Mono en `public/assets/fonts`, con precarga de Manrope.

**Por qué.** Sin dependencia de terceros, sin peticiones a otro dominio (privacidad, RGPD) y sin el retraso de conectar con otro origen.

---

## D13. La configuración de Firebase como secrets aunque no sea secreta

**Decisión.** Las variables `FIREBASE_*` viven en `.env` local y en GitHub Secrets; los archivos `environment*.ts` se generan y se ignoran en git.

**Por qué.** Mantener identificadores de proyecto fuera del historial público y de los logs, y poder rotarlos sin tocar el código. La protección real, cuando la app use Firebase, estará en las restricciones de la API key, las reglas de seguridad y App Check.

**A cambio.** Complejidad añadida (un script, una plantilla, siete secrets) para una configuración que la app aún no consume.

---

## D14. Standalone, señales y sin zonas

**Decisión.** Sin `NgModule`, sin `zone.js`, estado con `signal`/`computed`, entradas con `input()`/`model()`, salidas con `output()`, servicios con `@Service()`.

**Por qué.** Es el Angular actual. Menos código repetitivo, detección de cambios más predecible y mejor rendimiento de hidratación.
