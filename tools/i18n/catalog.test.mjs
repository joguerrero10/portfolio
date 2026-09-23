import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from './catalog.mjs';
const base = { title: 'Title', fields: ['Name', 'Email'], count: '{{count}} items' };
const makeCatalog = (en) => ({ es: base, en, pt: base });
test('accepts identical shapes and translated content', () => {
  assert.equal(validateCatalog(makeCatalog({ ...base, title: 'Título' })), 4);
});
for (const [name, value] of [
  ['missing key', { fields: base.fields, count: base.count }],
  ['extra key', { ...base, extra: 'Extra' }],
  ['missing array item', { ...base, fields: ['Name'] }],
  ['empty translation', { ...base, title: '  ' }],
  ['raw key', { ...base, title: 'portfolio.title' }],
  ['missing interpolation', { ...base, count: 'Items' }],
])
  test(`rejects ${name}`, () => assert.throws(() => validateCatalog(makeCatalog(value))));
