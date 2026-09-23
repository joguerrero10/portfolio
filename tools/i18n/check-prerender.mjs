import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { leaves, validateCatalog } from './catalog.mjs';

const locales = ['es', 'en', 'pt'];
const catalog = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [
      locale,
      JSON.parse(await fs.readFile(`content/${locale}.json`, 'utf8')),
    ]),
  ),
);
validateCatalog(catalog);
const profile = JSON.parse(await fs.readFile('content/profile.json', 'utf8'));
const rawKeys = new Set(leaves(catalog.es).flatMap(([key]) => [key, `portfolio.${key}`]));
const referencedAssets = new Map();
let pages = 0;
for (const locale of locales) {
  const copy = catalog[locale];
  const definitions = [
    ['', 'home', copy.headline[0], copy.intro],
    ['experience', 'experience', copy.experienceTitle, copy.experienceIntro],
    ['projects', 'projects', copy.projectsTitle, copy.projectsIntro],
    ['skills', 'skills', copy.skillsTitle, copy.skillsIntro],
    ['recruiter', 'recruiter', copy.quick, copy.quickDesc],
    ['contact', 'contact', copy.contactTitle, copy.contactIntro],
    ['not-found', 'notFound', copy.errors.notFound, copy.errors.notFoundDescription],
    ...profile.projects.map((p) => [
      `projects/${p.slug}`,
      'projectDetail',
      p.name,
      p.id === 'smartfinance' ? copy.financeDetail : copy.posDetail,
      p,
    ]),
  ];
  for (const [section, key, heading, description, project] of definitions) {
    const route = `/${locale}${section ? `/${section}` : ''}`;
    const html = await fs.readFile(`dist/portfolio/browser${route}/index.html`, 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const title = `${project ? `${project.name} · ${copy.seo.projectDetail}` : copy.seo[key]} — ${profile.name}`;
    assert.equal(doc.documentElement.lang, locale, route);
    assert.equal(doc.title, title, route);
    assert.equal(doc.querySelector('meta[name="description"]')?.content, description, route);
    assert.equal(doc.querySelector('meta[property="og:title"]')?.content, title, route);
    assert.equal(doc.querySelector('meta[property="og:description"]')?.content, description, route);
    assert.ok(doc.querySelector('h1')?.textContent.includes(heading), route);
    assert.equal(doc.querySelector('a[download]')?.getAttribute('href'), profile.cv.path, route);
    assert.equal(
      doc.querySelector('a[download]')?.getAttribute('aria-label'),
      copy.a11y.downloadCv,
      route,
    );
    // WCAG 2.5.3 applies to controls with a visible text label, not to named regions.
    for (const control of doc.querySelectorAll(
      'main a[aria-label], main button[aria-label], app-language-switcher a[aria-label]',
    )) {
      const label = control.getAttribute('aria-label');
      const visible = control.textContent.replace(/\s+/g, ' ').trim();
      if (!label || !visible) continue;
      assert.ok(
        label.toLowerCase().includes(visible.toLowerCase()),
        `${route}: accessible name "${label}" does not contain the visible label "${visible}"`,
      );
    }
    for (const target of locales) {
      const link = doc.querySelector(`app-language-switcher a[hreflang="${target}"]`);
      assert.equal(link?.getAttribute('href'), `/${target}${section ? `/${section}` : ''}`, route);
      assert.equal(
        link?.getAttribute('aria-label'),
        `${target.toUpperCase()} · ${copy.switchLanguage[target]}`,
        route,
      );
    }
    for (const link of doc.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (
        href.startsWith('/') &&
        !href.startsWith('/assets/') &&
        !link.closest('app-language-switcher')
      ) {
        assert.ok(
          href === `/${locale}` || href.startsWith(`/${locale}/`) || href.startsWith(`/${locale}#`),
          `${route}: language lost in ${href}`,
        );
      }
    }
    if (project)
      assert.ok(
        doc
          .querySelector('main')
          ?.textContent.includes(project.status === 'published' ? copy.live : copy.building),
        route,
      );
    const checkText = (text) => {
      assert.ok(!rawKeys.has(text.trim()), `${route}: raw key ${text}`);
      assert.ok(
        !/\{\{|\[object Object\]|portfolio\.(?:errors|seo|nav|form|a11y)\b/.test(text),
        `${route}: unresolved translation ${text}`,
      );
    };
    const walker = doc.createTreeWalker(doc.body, dom.window.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.parentElement?.closest('script, style')) checkText(node.textContent);
    }
    for (const element of doc.querySelectorAll('[aria-label], [alt], [title]')) {
      for (const attribute of ['aria-label', 'alt', 'title'])
        if (element.hasAttribute(attribute)) checkText(element.getAttribute(attribute));
    }
    // base href is '/', so every non-absolute reference resolves against the browser root.
    for (const element of doc.querySelectorAll('img[src], script[src], link[href], a[download]')) {
      const source = element.getAttribute('src') ?? element.getAttribute('href');
      if (!source || /^(?:[a-z]+:|\/\/|#)/i.test(source)) continue;
      referencedAssets.set(source.startsWith('/') ? source : `/${source}`, route);
    }
    if (project) {
      const main = doc.querySelector('main');
      assert.equal(
        main?.querySelector('.detail-fact dd')?.textContent.trim(),
        project.id === 'smartfinance' ? copy.architect : copy.architectPos,
        `${route}: project role`,
      );
      const links = [...main.querySelectorAll('.detail-links a')].map((link) =>
        link.getAttribute('href'),
      );
      assert.deepEqual(
        links,
        [project.demoUrl, project.repositoryUrl].filter((url) => url !== null),
        `${route}: confirmed links`,
      );
      if (!links.length) {
        assert.equal(
          main.querySelector('.links-pending')?.textContent.trim(),
          copy.empty.links,
          `${route}: pending links state`,
        );
      }
      assert.equal(
        main.querySelectorAll('.layer-list li').length,
        (project.architecture?.length ?? 0) + (project.technologies?.length ?? 0),
        `${route}: documented architecture only`,
      );
      // Untranslated source data must never reach the English or Portuguese pages.
      if (locale !== 'es') {
        assert.ok(
          !main.textContent.includes(project.summary),
          `${route}: untranslated project summary`,
        );
      }
    }
    if (key === 'contact') {
      const main = doc.querySelector('main');
      assert.equal(
        main.querySelector('.contact-mail')?.getAttribute('href'),
        `mailto:${profile.email}?subject=${encodeURIComponent(copy.mailSubject)}`,
        `${route}: encoded mailto`,
      );
      const social = [...main.querySelectorAll('.social-link')];
      assert.deepEqual(
        social.map((link) => link.getAttribute('href')),
        Object.values(profile.socials).filter((url) => url !== null),
        `${route}: confirmed profiles`,
      );
      for (const link of social) {
        assert.equal(link.getAttribute('rel'), 'noopener noreferrer', `${route}: external rel`);
        assert.ok(
          link.getAttribute('aria-label')?.includes(copy.a11y.externalLink),
          `${route}: new tab notice`,
        );
      }
      assert.equal(
        main.querySelectorAll('.social-pending').length,
        Object.values(profile.socials).filter((url) => url === null).length,
        `${route}: pending profiles`,
      );
      assert.ok(main.querySelector('a[download]'), `${route}: CV download`);
    }
    if (key === 'skills') {
      const groups = [...doc.querySelectorAll('.skill-group')];
      assert.equal(groups.length, copy.skillLabels.length, `${route}: skill groups`);
      assert.deepEqual(
        groups.map((group) => group.querySelector('h2')?.textContent.trim()),
        [...copy.skillLabels],
        `${route}: skill labels`,
      );
      assert.ok(doc.querySelector('.skill-chip'), `${route}: skill chips`);
      // Missions progress is navigation only and never gates the content.
      assert.equal(
        doc.querySelector('.progress-count')?.textContent.trim(),
        '1 / 6',
        `${route}: prerendered progress`,
      );
      assert.equal(
        doc.querySelector('.progress-note')?.textContent.trim(),
        copy.progressNote,
        `${route}: progress note`,
      );
      const output = doc.querySelector('.terminal-output');
      assert.equal(output?.getAttribute('aria-live'), 'polite', `${route}: terminal live region`);
      assert.equal(
        doc.querySelector('label[for="terminal-command"]')?.textContent.trim(),
        copy.terminalLabel,
        `${route}: terminal label`,
      );
      assert.ok(doc.querySelector('form.terminal-form button[type="submit"]'), `${route}: submit`);
    }
    if (key === 'experience') {
      const timeline = [...doc.querySelectorAll('.timeline-item')];
      assert.equal(timeline.length, copy.jobs.length, route);
      for (const [index, job] of copy.jobs.entries()) {
        const item = timeline[index];
        assert.equal(item.querySelector('.timeline-period')?.textContent.trim(), job.period, route);
        assert.equal(item.querySelector('.timeline-role')?.textContent.trim(), job.role, route);
        assert.ok(
          item.querySelector('.timeline-employer')?.textContent.includes(job.employer),
          `${route}: missing employer ${job.employer}`,
        );
        assert.equal(
          item.querySelectorAll('.progression-item').length,
          job.roles.length,
          `${route}: role progression for ${job.employer}`,
        );
      }
    }
    if (key === 'recruiter') {
      const text = doc.querySelector('main')?.textContent ?? '';
      assert.ok(text.includes(copy.years), `${route}: missing experience claim`);
      for (const item of copy.educationList) {
        assert.ok(text.includes(item), `${route}: missing education entry`);
      }
      assert.ok(
        text.includes(`${Math.round(profile.cv.bytes / 1024)} KB`),
        `${route}: missing real CV size`,
      );
      assert.equal(
        doc.querySelector('.fact a')?.getAttribute('href'),
        `mailto:${profile.email}`,
        route,
      );
    }
    if (key === 'home') {
      const hero = doc.querySelector('app-home-hero img');
      assert.equal(hero?.getAttribute('alt'), copy.a11y.commandRoom, route);
      assert.equal(
        [...doc.querySelectorAll('app-home-hero .hero-actions a')]
          .map((link) => link.getAttribute('href'))
          .join(' '),
        `/${locale}/projects ${profile.cv.path} /${locale}/recruiter`,
        route,
      );
      assert.deepEqual(
        [...doc.querySelectorAll('app-featured-missions .mission-link')].map((link) =>
          link.getAttribute('href'),
        ),
        profile.projects.map((item) => `/${locale}/projects/${item.slug}`),
        route,
      );
    }
    dom.window.close();
    pages++;
  }
}
assert.equal(pages, 27);
// The published PDF is the source of truth for the size shown to recruiters.
const cv = await fs.stat(`dist/portfolio/browser${profile.cv.path}`);
assert.equal(cv.size, profile.cv.bytes, 'content/profile.json declares a stale CV size');
for (const [asset, route] of referencedAssets) {
  await fs.access(`dist/portfolio/browser${asset}`).catch(() => {
    assert.fail(`${route}: missing build asset ${asset}`);
  });
}
console.log(
  `${pages} prerendered ES/EN/PT pages: translated titles, metadata, labels, CV note and status; preserved locale links; no raw keys. ${referencedAssets.size} referenced files exist in the build.`,
);
