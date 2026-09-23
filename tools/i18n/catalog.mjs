import assert from 'node:assert/strict';

export function leaves(value, prefix = '') {
  if (typeof value === 'string') return [[prefix, value]];
  assert.ok(value && typeof value === 'object', `Invalid translation at ${prefix}`);
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

export function validateCatalog(catalog) {
  const expected = leaves(catalog.es)
    .map(([key]) => key)
    .sort();
  for (const locale of ['es', 'en', 'pt']) {
    const entries = leaves(catalog[locale]);
    assert.deepEqual(
      entries.map(([key]) => key).sort(),
      expected,
      `Key/array shape mismatch: ${locale}`,
    );
    for (const [key, value] of entries) {
      assert.ok(value.trim(), `Empty translation: ${locale}.${key}`);
      assert.notEqual(value, key, `Raw key: ${locale}.${key}`);
      assert.notEqual(value, `portfolio.${key}`, `Raw key: ${locale}.${key}`);
      const placeholders = (text) =>
        [...text.matchAll(/{{\s*([^}]+?)\s*}}/g)].map((match) => match[1]).sort();
      const original = leaves(catalog.es).find(([name]) => name === key)[1];
      assert.deepEqual(
        placeholders(value),
        placeholders(original),
        `Interpolation mismatch: ${locale}.${key}`,
      );
    }
  }
  return expected.length;
}
