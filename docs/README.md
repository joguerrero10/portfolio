# Documentación técnica del portafolio

Esta carpeta explica cómo está construido el portafolio de Joel Guerrero: qué hace cada archivo, cómo se hablan las piezas entre sí y por qué se tomaron ciertas decisiones. El `README.md` de la raíz solo cubre instalación y compilación; todo lo demás vive aquí.

Los diagramas están escritos en [Mermaid](https://mermaid.js.org/), así que GitHub los dibuja directamente. En otros visores puede hacer falta una extensión.

## Por dónde empezar

Si es tu primera vez en el proyecto, lee en este orden:

1. [Visión general](01-vision-general.md): qué es la aplicación, con qué está hecha y cómo se ve desde lejos.
2. [Arquitectura por capas](02-arquitectura.md): las cinco capas de `src/app` y la regla de dependencias entre ellas.
3. [Estructura de carpetas](03-estructura-de-carpetas.md): el árbol del repositorio comentado carpeta por carpeta.

Con eso ya puedes moverte por el código. El resto son referencias para cuando necesites tocar algo concreto.

## Referencia

| Documento                                                  | Cuándo leerlo                                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [Arranque y configuración](04-arranque-y-configuracion.md) | Vas a cambiar providers, `angular.json`, TypeScript o el renderizado en servidor.             |
| [Enrutamiento y prerender](05-enrutamiento.md)             | Vas a añadir una página, un guard o una ruta nueva.                                           |
| [Internacionalización](06-internacionalizacion.md)         | Vas a tocar textos, idiomas o el selector de idioma.                                          |
| [Contenido y datos](07-contenido-y-datos.md)               | Vas a editar el perfil, los proyectos, la experiencia o las habilidades.                      |
| [Servicios de `core`](08-servicios-core.md)                | Necesitas entender la fachada, el contexto de idioma, el progreso o la estrategia de títulos. |
| [Componentes](09-componentes.md)                           | Vas a crear o modificar un componente visual.                                                 |
| [SEO y metadatos](10-seo.md)                               | Vas a cambiar títulos, descripciones, canonical, hreflang, JSON-LD o el sitemap.              |
| [Estilos y contrato CSS](11-estilos.md)                    | Vas a escribir SCSS y te preguntas por qué Stylelint rechaza `px` o `position`.               |
| [Herramientas y scripts](12-herramientas.md)               | Quieres saber qué hace cada `npm run …` y cada archivo de `tools/`.                           |
| [Pruebas y calidad](13-pruebas.md)                         | Vas a escribir tests o a averiguar por qué falla uno.                                         |
| [Entorno y despliegue](14-despliegue.md)                   | Vas a configurar variables de entorno, Firebase Hosting o GitHub Actions.                     |
| [Decisiones técnicas](15-decisiones-tecnicas.md)           | Te preguntas "¿por qué se hizo así?" antes de cambiarlo.                                      |
| [Deuda técnica y pendientes](16-deuda-tecnica.md)          | Quieres saber qué está roto, a medias o merece revisión.                                      |

## Convenciones de esta documentación

- Las rutas de archivo son relativas a la raíz del repositorio.
- Cuando se cita una clase o función se usa el nombre exacto del código (`PortfolioFacade`, `localeGuard`).
- Si algo del código contradice lo que dice aquí, manda el código. Corrige el documento en el mismo cambio.
