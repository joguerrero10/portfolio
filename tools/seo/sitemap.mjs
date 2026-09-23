import fs from 'node:fs/promises';
import path from 'node:path';

export function resolveOrigin(config) {
  if (config.origin) {
    const url = new URL(config.origin);
    if (url.protocol !== 'https:') throw new Error('The public origin must use HTTPS.');
    return url.origin;
  }
  if (config.firebaseProjectId) {
    if (!/^[a-z0-9-]+$/.test(config.firebaseProjectId)) {
      throw new Error(`Invalid Firebase project id: ${config.firebaseProjectId}`);
    }
    return `https://${config.firebaseProjectId}.web.app`;
  }
  return null;
}

export async function prerenderedRoutes(root) {
  const routes = [];
  async function walk(directory, prefix) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const next = `${prefix}/${entry.name}`;
      if (entry.name === 'not-found') continue;
      const hasPage = await fs
        .access(path.join(directory, entry.name, 'index.html'))
        .then(() => true)
        .catch(() => false);
      if (hasPage) routes.push(next);
      await walk(path.join(directory, entry.name), next);
    }
  }
  await walk(root, '');
  return routes.sort();
}

export function sitemapXml(origin, routes) {
  const urls = routes
    .map((route) => `  <url>\n    <loc>${origin}${route}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(origin) {
  const lines = ['User-agent: *', 'Allow: /'];
  if (origin) lines.push('', `Sitemap: ${origin}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}
