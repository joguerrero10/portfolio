import assert from 'node:assert/strict';

export function leaves(value, prefix = '') {
  if (typeof value === 'string') return [[prefix, value]];
  assert.ok(value && typeof value === 'object', `Invalid translation at ${prefix}`);
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

const PROJECT_COPY_TEXT = ['category', 'origin', 'cardDescription', 'detail', 'role'];

export function validateProjectCopy(catalog, profile) {
  for (const locale of ['es', 'en', 'pt']) {
    const projectCopy = catalog[locale].projectCopy ?? {};
    for (const { id } of profile.projects) {
      const entry = Object.hasOwn(projectCopy, id) ? projectCopy[id] : undefined;
      assert.ok(entry, `Missing projectCopy.${id} in content/${locale}.json`);
      for (const field of PROJECT_COPY_TEXT) {
        assert.ok(
          typeof entry[field] === 'string' && entry[field].trim(),
          `Missing projectCopy.${id}.${field} in content/${locale}.json`,
        );
      }
      for (const field of ['architecture', 'decisions']) {
        assert.ok(
          Array.isArray(entry[field]),
          `Missing projectCopy.${id}.${field} in content/${locale}.json`,
        );
      }
    }
    for (const id of Object.keys(projectCopy)) {
      assert.ok(
        profile.projects.some((project) => project.id === id),
        `Unknown project in content/${locale}.json: projectCopy.${id}`,
      );
    }
  }
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
