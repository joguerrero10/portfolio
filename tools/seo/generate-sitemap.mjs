import fs from 'node:fs/promises';
import { prerenderedRoutes, resolveOrigin, robotsTxt, sitemapXml } from './sitemap.mjs';

const root = 'dist/portfolio/browser';
const config = JSON.parse(await fs.readFile('content/site.json', 'utf8'));
const origin = resolveOrigin(config);
const routes = await prerenderedRoutes(root);

await fs.writeFile(`${root}/robots.txt`, robotsTxt(origin));
if (!origin) {
  await fs.rm(`${root}/sitemap.xml`, { force: true });
  console.log(
    `robots.txt written for ${routes.length} prerendered pages. No sitemap: content/site.json has no origin yet.`,
  );
} else {
  await fs.writeFile(`${root}/sitemap.xml`, sitemapXml(origin, routes));
  console.log(`sitemap.xml and robots.txt written with ${routes.length} URLs on ${origin}.`);
}
