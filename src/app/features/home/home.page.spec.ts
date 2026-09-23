import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

describe('Home composition', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        providePortfolioI18n(),
        { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
      ],
    });
  });

  for (const locale of LOCALES) {
    it(`renders the ${locale} hero, technologies and missions with real routes`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const profile = repository.getProfile();

      const heading = root.querySelector('app-home-hero h1')!;
      expect(heading.textContent).toContain(copy.headline[0]);
      expect(heading.querySelector('.heading-accent')?.textContent).toContain(copy.headline[1]);
      expect(root.querySelector('app-home-hero .eyebrow')?.textContent?.trim()).toBe(copy.station);
      expect(root.querySelector('app-home-hero .hero-description')?.textContent).toContain(
        copy.intro,
      );

      const actions = [
        ...root.querySelectorAll<HTMLAnchorElement>('app-home-hero .hero-actions a'),
      ];
      expect(actions.map((action) => action.getAttribute('href'))).toEqual([
        `/${locale}/projects`,
        profile.cv.path,
        `/${locale}/recruiter`,
      ]);
      expect(actions.map((action) => action.textContent?.trim())).toEqual([
        copy.projects,
        copy.cv,
        copy.recruiter,
      ]);
      expect(actions[1]?.getAttribute('aria-label')).toBe(copy.a11y.downloadCv);

      const hero = root.querySelector<HTMLImageElement>('app-home-hero .hero-image')!;
      expect(hero.getAttribute('src')).toBe('/assets/images/banner-desktop.webp');
      expect(root.querySelector('app-home-hero .hero-figure source')?.getAttribute('srcset')).toBe(
        '/assets/images/mobile-banner.webp',
      );
      expect(hero.getAttribute('alt')).toBe(copy.a11y.commandRoom);
      expect(hero.getAttribute('fetchpriority')).toBe('high');
      expect(hero.hasAttribute('loading')).toBe(false);
      expect(hero.hasAttribute('width')).toBe(false);
      expect(hero.hasAttribute('height')).toBe(false);

      expect(root.querySelector('app-tech-row h2')?.textContent?.trim()).toBe(copy.tech);
      expect(
        [...root.querySelectorAll('app-tech-row .tech-item')].map((item) =>
          item.textContent?.trim(),
        ),
      ).toEqual(['AWS', 'Azure', 'OCI', 'Terraform']);

      expect(root.querySelector('app-featured-missions h2')?.textContent?.trim()).toBe(
        copy.featured,
      );
      expect(
        root.querySelector('app-featured-missions .missions-header a')?.getAttribute('href'),
      ).toBe(`/${locale}/projects`);

      const missions = [...root.querySelectorAll('app-featured-missions .mission')];
      expect(missions).toHaveLength(profile.projects.length);
      expect(
        missions.map((mission) => mission.querySelector('.mission-link')?.getAttribute('href')),
      ).toEqual(profile.projects.map((project) => `/${locale}/projects/${project.slug}`));
      expect(
        missions.map((mission) => mission.querySelector('.mission-name')?.textContent?.trim()),
      ).toEqual(profile.projects.map((project) => project.name));
      expect(
        missions.map((mission) => mission.querySelector('.mission-status')?.textContent?.trim()),
      ).toEqual([copy.live, copy.building]);
      expect(
        missions.map((mission) => mission.querySelector('.mission-meta span')?.textContent?.trim()),
      ).toEqual([copy.finance, copy.pos]);
      expect(
        missions.map((mission) => mission.querySelector('.mission-summary')?.textContent?.trim()),
      ).toEqual([copy.financeDesc, copy.posDesc]);
      expect(
        missions.map((mission) => mission.querySelector('.mission-image')?.getAttribute('src')),
      ).toEqual(profile.projects.map((project) => project.image));
      expect(
        missions.map((mission) => mission.querySelector('.mission-image')?.getAttribute('alt')),
      ).toEqual(['', '']);
      expect(
        missions.map((mission) => mission.querySelector('.mission-image')?.getAttribute('loading')),
      ).toEqual(['lazy', 'lazy']);
    });
  }

  it('keeps every home link resolvable, without empty or placeholder targets', async () => {
    const harness = await RouterTestingHarness.create('/pt');
    const links = [...harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('main a')];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
      expect(link.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('shows the localized empty state when there are no projects', async () => {
    const repository = TestBed.inject(PortfolioRepository);
    const profile = repository.getProfile();
    vi.spyOn(repository, 'getProfile').mockReturnValue({ ...profile, projects: [] });
    const harness = await RouterTestingHarness.create('/en');
    expect(harness.routeNativeElement?.querySelector('.mission-empty')?.textContent?.trim()).toBe(
      repository.getCopy('en').empty.projects,
    );
  });

  it('fails fast if a featured technology disappears from the skills content', () => {
    const repository = TestBed.inject(PortfolioRepository);
    vi.spyOn(repository, 'getSkills').mockReturnValue([['Angular']]);
    expect(() => TestBed.runInInjectionContext(() => new PortfolioFacade())).toThrowError(
      /content\/skills\.json/,
    );
  });
});
