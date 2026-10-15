import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateCatalog, validateProjectCopy } from './catalog.mjs';
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

const entry = {
  category: 'Category',
  origin: 'Personal project',
  cardDescription: 'Card',
  detail: 'Detail',
  role: 'Developer',
  architecture: ['MVC'],
  decisions: ['Decision'],
};
const profile = { projects: [{ id: 'alpha' }, { id: 'beta' }] };
const withProjects = (pt) => ({
  es: { projectCopy: { alpha: entry, beta: entry } },
  en: { projectCopy: { alpha: entry, beta: entry } },
  pt: { projectCopy: pt },
});
test('accepts projectCopy for every project in every language', () => {
  assert.doesNotThrow(() =>
    validateProjectCopy(withProjects({ alpha: entry, beta: entry }), profile),
  );
});
for (const [name, pt, pattern] of [
  ['a project without projectCopy', { alpha: entry }, /Missing projectCopy\.beta in content\/pt/],
  ['an incomplete projectCopy', { alpha: entry, beta: { ...entry, detail: ' ' } }, /beta\.detail/],
  [
    'a projectCopy without architecture',
    { alpha: entry, beta: { ...entry, architecture: undefined } },
    /beta\.architecture/,
  ],
  ['projectCopy for an unknown project', { alpha: entry, beta: entry, gamma: entry }, /gamma/],
])
  test(`rejects ${name}`, () =>
    assert.throws(() => validateProjectCopy(withProjects(pt), profile), pattern));

test('covers every project of the real content and breaks for an id without projectCopy', async () => {
  const read = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
  const catalog = {
    es: await read('content/es.json'),
    en: await read('content/en.json'),
    pt: await read('content/pt.json'),
  };
  const real = await read('content/profile.json');
  assert.doesNotThrow(() => validateProjectCopy(catalog, real));
  assert.throws(
    () => validateProjectCopy(catalog, { projects: [...real.projects, { id: 'missing-copy' }] }),
    /Missing projectCopy\.missing-copy in content\/es\.json/,
  );
});
