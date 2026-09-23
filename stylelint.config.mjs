// Contrato CSS: el layout se resuelve con Grid/Flex y espaciado en rem, sin posicionamiento
// manual. Las excepciones se declaran abajo, archivo por archivo y con su motivo.
const POSITIONING = [
  'position',
  '/^inset(?:-|$)/',
  'top',
  'right',
  'bottom',
  'left',
  'float',
  'z-index',
  'translate',
  'transform',
  '/^offset(?:-|$)/',
  'grid-area',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'order',
];
// El contrato completo menos las propiedades que una excepción concreta habilita.
const except = (...allowed) => POSITIONING.filter((property) => !allowed.includes(property));
// Habilitar los insets lógicos no debe reabrir el atajo `inset` ni los físicos.
const LOGICAL_INSETS = ['/^inset(?:-|$)/'];

export default {
  customSyntax: 'postcss-scss',
  plugins: ['stylelint-scss', './tools/styles/rem-flow-rule.mjs'],
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    'vendor/**',
    'kit-angular-firebase/**',
    'public/assets/**',
    'src/assets/**',
  ],
  rules: {
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'selector-pseudo-class-no-unknown': true,
    'declaration-block-no-duplicate-properties': true,
    'unit-allowed-list': ['rem', 'em', 'fr', 's', 'ms', 'deg'],
    'property-disallowed-list': POSITIONING,
    'declaration-property-value-disallowed-list': {
      'grid-column': ['/\\/\\s*(?:span\\s+)?0(?:$|\\s)/'],
    },
    'scss/at-rule-no-unknown': true,
    'portfolio/rem-flow': true,
  },
  overrides: [
    {
      // Excepción acordada: la ilustración del hero sangra hasta el borde del marco y la montaña
      // ancla el pie del sidebar. Solo esas dos imágenes decorativas pueden usar porcentajes y
      // márgenes negativos; el resto del proyecto mantiene el contrato rem + Grid/Flex.
      files: [
        'src/app/features/home/hero/hero.scss',
        'src/app/layout/sidebar-nav/sidebar-nav.scss',
      ],
      rules: {
        'unit-allowed-list': ['rem', 'em', 'fr', 's', 'ms', 'deg', '%'],
        'portfolio/rem-flow': null,
      },
    },
    {
      // Excepción acordada, acotada al banner del hero: la ilustración invade la columna de
      // texto y cubre las dos filas de la rejilla, con el texto apilado por encima.
      files: ['src/app/features/home/hero/hero.scss'],
      rules: {
        'property-disallowed-list': except('position', 'z-index', 'grid-row'),
      },
    },
    {
      // Excepción acordada, acotada al pie del sidebar: el lema de diseño se superpone a la
      // montaña.
      files: ['src/app/layout/sidebar-nav/sidebar-nav.scss'],
      rules: {
        'property-disallowed-list': [...except('position', ...LOGICAL_INSETS), 'inset'],
      },
    },
    {
      // Excepción acordada, acotada al selector de idioma: en móvil el listado se despliega
      // sobre el contenido desde un botón compacto, sin empujar la fila del encabezado.
      files: ['src/app/layout/language-switcher/language-switcher.scss'],
      rules: {
        'property-disallowed-list': [...except('position', 'z-index', ...LOGICAL_INSETS), 'inset'],
      },
    },
  ],
};
