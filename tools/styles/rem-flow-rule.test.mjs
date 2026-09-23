import test from 'node:test';
import assert from 'node:assert/strict';
import stylelint from 'stylelint';
import config from '../../stylelint.config.mjs';

const valid = [
  '.a { display: grid; grid-template-columns: 12rem minmax(0, 1fr); gap: 1rem; line-height: 1.65; aspect-ratio: 131 / 120; }',
  '@media (min-width: 40em) { .a { padding: .5em; outline: .125rem solid #d6ad70; } }',
  ':root { --duration-color: 160ms; --space: 1rem; } .a { margin: var(--space); transition: color var(--duration-color); }',
  '$space: 1rem; .a { padding: $space; &:hover { color: #eeeae2; } }',
];
const invalid = [
  '.a { position: relative; }',
  '.a { inset-inline-start: 0; }',
  '.a { z-index: 1; }',
  '.a { float: inline-start; }',
  '.a { padding: 16px; }',
  '.a { width: 100%; }',
  '@media (width: 900px) { .a { color: #fff; } }',
  ':root { --space: 2vw; }',
  '.a { padding: 1s; }',
  '.a { margin: 2deg; }',
  '.a { padding: 1fr; }',
  '.a { margin-inline: -.5rem; }',
  ':root { --negative: -1rem; } .a { margin: var(--negative); }',
  '.a { margin: calc(1rem - 2rem); }',
  '.a { transform: translateX(1rem); }',
  '.a { grid-area: shared; }',
  '.a { grid-row: 1; }',
  '.a { order: -1; }',
  '.a { inline-size: 12; }',
  ':root { --size: 2s; }',
];
for (const css of valid)
  test(`accepts ${css}`, async () => {
    const result = await stylelint.lint({ code: css, codeFilename: 'contract.scss', config });
    assert.equal(result.errored, false, result.report);
  });
for (const css of invalid)
  test(`rejects ${css}`, async () => {
    const result = await stylelint.lint({ code: css, codeFilename: 'contract.scss', config });
    assert.equal(result.errored, true, css);
  });
