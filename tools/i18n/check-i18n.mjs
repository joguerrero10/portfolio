import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { validateCatalog } from './catalog.mjs';

const locales = ['es', 'en', 'pt'];
const catalog = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [
      locale,
      JSON.parse(await fs.readFile(`content/${locale}.json`, 'utf8')),
    ]),
  ),
);
const count = validateCatalog(catalog);
for (const locale of locales) {
  if (process.argv.includes('--sync'))
    await fs.copyFile(`content/${locale}.json`, `public/i18n/${locale}.json`);
  const publicCopy = JSON.parse(await fs.readFile(`public/i18n/${locale}.json`, 'utf8'));
  assert.deepEqual(
    publicCopy,
    catalog[locale],
    `Stale public/i18n/${locale}.json; run npm run sync:i18n`,
  );
}
console.log(
  `${count} equivalent, nonempty translation leaves per locale; ES/EN/PT public dictionaries synchronized.`,
);
