import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

describe('Projects listing and detail', () => {
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
    it(`lists both ${locale} projects with their real status and detail route`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/projects`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const projects = repository.getProfile().projects;

      expect(root.querySelector('h1')?.textContent).toContain(copy.projectsTitle);
      const cards = [...root.querySelectorAll('app-project-card')];
      expect(cards).toHaveLength(projects.length);
      expect(
        cards.map((card) => card.querySelector('.mission-link')?.getAttribute('href')),
      ).toEqual(projects.map((project) => `/${locale}/projects/${project.slug}`));
      // The listing owns the section outline, so its cards are level two.
      expect(cards.map((card) => card.querySelector('.mission-name')?.tagName)).toEqual([
        'H2',
        'H2',
      ]);
      expect(
        cards.map((card) => card.querySelector('.mission-status')?.textContent?.trim()),
      ).toEqual([copy.live, copy.building]);
    });

    it(`opens the ${locale} SmartPOS case with documented architecture only`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/projects/smartpos-pty`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const project = repository.getProfile().projects.find((item) => item.id === 'smartpos')!;

      expect(root.querySelector('h1')?.textContent?.trim()).toBe(project.name);
      expect(root.querySelector('.detail-status')?.textContent).toContain(copy.building);
      expect(root.querySelector('.detail-description')?.textContent?.trim()).toBe(copy.posDetail);
      expect(root.querySelector('.detail-fact dd')?.textContent?.trim()).toBe(copy.architectPos);
      expect(root.querySelector('.detail-image')?.getAttribute('src')).toBe(project.image);

      // No confirmed links yet: informative state, never an empty anchor.
      expect(root.querySelectorAll('.detail-links a')).toHaveLength(0);
      expect(root.querySelector('.links-pending')?.textContent?.trim()).toBe(copy.empty.links);

      const chips = [...root.querySelectorAll('.layer-list li')].map((chip) =>
        chip.textContent?.trim(),
      );
      expect(chips).toEqual([...(project.architecture ?? []), ...(project.technologies ?? [])]);

      const details = root.querySelector('details')!;
      expect(details.querySelector('summary')?.textContent?.trim()).toBe(copy.architectureDetail);
      expect(
        [...details.querySelectorAll('.decision-list li')].map((li) => li.textContent),
      ).toEqual([...copy.posDecisions]);
      expect(details.querySelector('.decisions-note')?.textContent?.trim()).toBe(
        copy.decisionsNote,
      );
    });

    it(`opens the ${locale} SmartFinance case with its confirmed links`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/projects/smartfinance-pty`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const project = repository.getProfile().projects.find((item) => item.id === 'smartfinance')!;

      expect(root.querySelector('.detail-status')?.textContent).toContain(copy.live);
      expect(root.querySelector('.detail-fact dd')?.textContent?.trim()).toBe(copy.architect);
      const links = [...root.querySelectorAll<HTMLAnchorElement>('.detail-links a')];
      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        project.demoUrl,
        project.repositoryUrl,
      ]);
      expect(links.map((link) => link.getAttribute('rel'))).toEqual([
        'noopener noreferrer',
        'noopener noreferrer',
      ]);
      expect(links.map((link) => link.textContent?.trim())).toEqual([copy.demo, copy.repository]);
      // SmartFinance has no documented stack: nothing is invented for it.
      expect(root.querySelector('.detail-architecture')).toBeNull();
      expect(root.querySelector('details')).toBeNull();
    });
  }

  it('keeps every detail text translated, without leaking the Spanish profile data', async () => {
    const harness = await RouterTestingHarness.create('/en/projects/smartfinance-pty');
    const repository = TestBed.inject(PortfolioRepository);
    const project = repository.getProfile().projects.find((item) => item.id === 'smartfinance')!;
    for (const locale of ['en', 'pt'] as const) {
      await harness.navigateByUrl(`/${locale}/projects/smartfinance-pty`);
      const text = harness.routeNativeElement!.querySelector('main')?.textContent ?? '';
      expect(text).not.toContain(project.summary);
      expect(text).toContain(repository.getCopy(locale).financeDetail);
    }
  });

  it('moves between both cases and back to the listing', async () => {
    const harness = await RouterTestingHarness.create('/es/projects/smartfinance-pty');
    const next = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.detail-next')!;
    expect(next.getAttribute('href')).toBe('/es/projects/smartpos-pty');
    next.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/es/projects/smartpos-pty');
    const back = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.detail-back')!;
    expect(back.getAttribute('href')).toBe('/es/projects');
    back.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/es/projects');
  });

  it('sends unknown slugs to the localized not-found page', async () => {
    await RouterTestingHarness.create('/en/projects/unknown-mission');
    expect(TestBed.inject(Router).url).toBe('/en/not-found');
  });
});
