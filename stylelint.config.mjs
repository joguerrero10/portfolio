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
const except = (...allowed) => POSITIONING.filter((property) => !allowed.includes(property));
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
      files: ['src/app/features/home/hero/hero.scss'],
      rules: {
        'property-disallowed-list': except('position', 'z-index', 'grid-row'),
      },
    },
    {
      files: ['src/app/layout/sidebar-nav/sidebar-nav.scss'],
      rules: {
        'property-disallowed-list': [...except('position', ...LOGICAL_INSETS), 'inset'],
      },
    },
    {
      files: ['src/app/layout/language-switcher/language-switcher.scss'],
      rules: {
        'property-disallowed-list': [...except('position', 'z-index', ...LOGICAL_INSETS), 'inset'],
      },
    },
  ],
};
