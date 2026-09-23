import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import site from '../../../content/site.json';
import { routes } from '../app.routes';
import { StaticPortfolioRepository } from '../data-access/static-portfolio.repository';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { resolveOrigin } from '../domain/site';
import { providePortfolioI18n } from './i18n.providers';
import { SeoTags } from './seo-tags';

function head() {
  return {
    canonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    alternates: [...document.head.querySelectorAll('link[rel="alternate"][hreflang]')].map(
      (link) => `${link.getAttribute('hreflang')}=${link.getAttribute('href')}`,
    ),
    jsonLd: document.head.querySelector('#portfolio-structured-data')?.textContent ?? null,
  };
}

describe('SEO head tags', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        providePortfolioI18n(),
        { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
      ],
    });
  });

  afterEach(() => {
    for (const node of document.head.querySelectorAll(
      'link[rel="canonical"], link[rel="alternate"][hreflang], #portfolio-structured-data',
    )) {
      node.remove();
    }
  });

  it('publishes canonical and hreflang for every locale once an origin is configured', () => {
    const seo = TestBed.inject(SeoTags);
    const data = [{ '@type': 'Person', name: 'Joel Guerrero' }];
    seo.update({
      origin: 'https://example.web.app',
      path: '/pt/projects/smartpos-pty',
      locale: 'pt',
      structuredData: data,
    });
    expect(head().canonical).toBe('https://example.web.app/pt/projects/smartpos-pty');
    expect(head().alternates).toEqual([
      'es=https://example.web.app/es/projects/smartpos-pty',
      'en=https://example.web.app/en/projects/smartpos-pty',
      'pt=https://example.web.app/pt/projects/smartpos-pty',
      'x-default=https://example.web.app/es/projects/smartpos-pty',
    ]);

    // A second navigation replaces the tags instead of stacking them.
    seo.update({
      origin: 'https://example.web.app',
      path: '/en',
      locale: 'en',
      structuredData: data,
    });
    expect(head().canonical).toBe('https://example.web.app/en');
    expect(head().alternates).toHaveLength(4);
  });

  it('emits no canonical or hreflang while the domain is unknown', () => {
    const seo = TestBed.inject(SeoTags);
    seo.update({
      origin: 'https://example.web.app',
      path: '/es',
      locale: 'es',
      structuredData: [{ '@type': 'Person', name: 'Joel Guerrero' }],
    });
    seo.update({ origin: null, path: '/es', locale: 'es', structuredData: [] });
    expect(head().canonical).toBeNull();
    expect(head().alternates).toEqual([]);
    expect(head().jsonLd).toBeNull();
  });

  it('describes the person and the project with confirmed facts only', async () => {
    await RouterTestingHarness.create('/en/projects/smartfinance-pty');
    const graph = JSON.parse((head().jsonLd ?? '{}').replaceAll('\\u003c', '<'));
    const [person, work] = graph['@graph'];
    const repository = TestBed.inject(PortfolioRepository);
    const profile = repository.getProfile();
    const project = profile.projects.find((item) => item.id === 'smartfinance')!;

    expect(person['@type']).toBe('Person');
    expect(person.name).toBe(profile.name);
    expect(person.jobTitle).toBe(profile.role);
    expect(person.sameAs).toEqual(Object.values(profile.socials).filter((url) => url !== null));
    expect(work['@type']).toBe('CreativeWork');
    expect(work.name).toBe(project.name);
    expect(work.creativeWorkStatus).toBe('Published');
    expect(work.description).toBe(repository.getCopy('en').financeDetail);
    expect(work.sameAs).toEqual([project.demoUrl, project.repositoryUrl]);
    // Nothing is published about certifications, metrics or audits.
    expect(head().jsonLd).not.toMatch(/TOGAF|PCI|award|rating|certificat/i);
    // The configured origin decides whether absolute URLs exist at all.
    expect(head().canonical).toBe(
      resolveOrigin(site) && `${resolveOrigin(site)}/en/projects/smartfinance-pty`,
    );
  });
});
