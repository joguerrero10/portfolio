import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

const STATUS_KEYS = {
  published: 'live',
  'in-development': 'building',
  completed: 'finished',
} as const;

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
    it(`lists all six ${locale} projects in order with their real status and detail route`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/projects`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const projects = repository.getProfile().projects;

      expect(projects.map((project) => project.name)).toEqual([
        'SmartFinance Pty',
        'SmartPOS Pty',
        'OmniSphere AI',
        'Helpdesk AI Automation',
        'World Cup Predictor AI',
        'Black Ninja',
      ]);
      expect(root.querySelector('h1')?.textContent).toContain(copy.projectsTitle);
      const cards = [...root.querySelectorAll('app-project-card')];
      expect(cards).toHaveLength(6);
      expect(
        cards.map((card) => card.querySelector('.mission-link')?.getAttribute('href')),
      ).toEqual(projects.map((project) => `/${locale}/projects/${project.slug}`));
      expect(cards.map((card) => card.querySelector('.mission-name')?.textContent?.trim())).toEqual(
        projects.map((project) => project.name),
      );
      expect(cards.map((card) => card.querySelector('.mission-name')?.tagName)).toEqual(
        projects.map(() => 'H2'),
      );
      expect(
        cards.map((card) => card.querySelector('.mission-status')?.textContent?.trim()),
      ).toEqual([
        copy.live,
        copy.building,
        copy.building,
        copy.building,
        copy.building,
        copy.finished,
      ]);
      expect(
        cards.map((card) => card.querySelector('.mission-summary')?.textContent?.trim()),
      ).toEqual(
        projects.map((project) => repository.getProjectCopy(locale, project.id).cardDescription),
      );
    });

    it(`opens the ${locale} SmartPOS case with documented architecture only`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/projects/smartpos-pty`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const project = repository.getProfile().projects.find((item) => item.id === 'smartpos')!;
      const projectCopy = repository.getProjectCopy(locale, project.id);

      expect(root.querySelector('h1')?.textContent?.trim()).toBe(project.name);
      expect(root.querySelector('.detail-status')?.textContent).toContain(copy.building);
      expect(root.querySelector('.detail-description')?.textContent?.trim()).toBe(
        projectCopy.detail,
      );
      expect(root.querySelector('.detail-fact dd')?.textContent?.trim()).toBe(projectCopy.role);
      expect(root.querySelector('.detail-image')?.getAttribute('src')).toBe(project.image);

      expect(root.querySelectorAll('.detail-links a')).toHaveLength(0);
      expect(root.querySelector('.links-pending')?.textContent?.trim()).toBe(copy.empty.links);
      expect(root.querySelector('.detail-note')).toBeNull();

      const chips = [...root.querySelectorAll('.layer-list li')].map((chip) =>
        chip.textContent?.trim(),
      );
      expect(chips).toEqual([...projectCopy.architecture, ...(project.technologies ?? [])]);
      if (locale !== 'es') expect(chips).not.toContain('Importes monetarios enteros');

      const details = root.querySelector('details')!;
      expect(details.querySelector('summary')?.textContent?.trim()).toBe(copy.architectureDetail);
      expect(
        [...details.querySelectorAll('.decision-list li')].map((li) => li.textContent),
      ).toEqual([...projectCopy.decisions]);
      expect(details.querySelector('.decisions-note')?.textContent?.trim()).toBe(
        copy.decisionsNote,
      );
    });

    it(`opens the ${locale} SmartFinance case with its confirmed links and note`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/projects/smartfinance-pty`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const project = repository.getProfile().projects.find((item) => item.id === 'smartfinance')!;
      const projectCopy = repository.getProjectCopy(locale, project.id);

      expect(root.querySelector('.detail-status')?.textContent).toContain(copy.live);
      expect(root.querySelector('.detail-meta')?.textContent).toContain(projectCopy.origin);
      expect(root.querySelector('.detail-fact dd')?.textContent?.trim()).toBe(projectCopy.role);
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
      expect(root.querySelector('.detail-note')?.textContent?.trim()).toBe(projectCopy.note);
      expect(
        [...root.querySelectorAll('details .decision-list li')].map((li) => li.textContent),
      ).toEqual([...projectCopy.decisions]);
    });

    for (const [id, slug] of [
      ['omnisphere-ai', 'omnisphere-ai'],
      ['helpdesk-ai', 'helpdesk-ai-automation'],
      ['world-cup-predictor', 'world-cup-predictor-ai'],
      ['black-ninja', 'black-ninja'],
    ] as const) {
      it(`opens the ${locale} ${slug} case from its projectCopy`, async () => {
        const harness = await RouterTestingHarness.create(`/${locale}/projects/${slug}`);
        const root = harness.routeNativeElement!;
        const repository = TestBed.inject(PortfolioRepository);
        const copy = repository.getCopy(locale);
        const project = repository.getProfile().projects.find((item) => item.slug === slug)!;
        const projectCopy = repository.getProjectCopy(locale, id);

        expect(project.id).toBe(id);
        expect(TestBed.inject(Router).url).toBe(`/${locale}/projects/${slug}`);
        expect(root.querySelector('h1')?.textContent?.trim()).toBe(project.name);
        expect(root.querySelector('.eyebrow')?.textContent?.trim()).toBe(projectCopy.category);
        expect(root.querySelector('.detail-status')?.textContent).toContain(
          copy[STATUS_KEYS[project.status]],
        );
        expect(root.querySelector('.detail-meta')?.textContent).toContain(projectCopy.origin);
        expect(root.querySelector('.detail-meta')?.textContent).not.toContain('SmartNova');
        expect(root.querySelector('.detail-description')?.textContent?.trim()).toBe(
          projectCopy.detail,
        );
        expect(root.querySelector('.detail-fact dd')?.textContent?.trim()).toBe(projectCopy.role);
        expect(root.querySelector('.detail-image')?.getAttribute('src')).toBe(project.image);
        const links = [...root.querySelectorAll<HTMLAnchorElement>('.detail-links a')];
        expect(links.map((link) => link.getAttribute('href'))).toEqual([project.repositoryUrl]);
        expect(links.map((link) => link.getAttribute('rel'))).toEqual(['noopener noreferrer']);
        expect(links.map((link) => link.textContent?.trim())).toEqual([copy.repository]);
        expect(root.querySelector('.links-pending')).toBeNull();
        expect(root.querySelector('.detail-note')).toBeNull();
        expect(
          [...root.querySelectorAll('.layer-list li')].map((chip) => chip.textContent?.trim()),
        ).toEqual([...projectCopy.architecture, ...(project.technologies ?? [])]);
        expect(
          [...root.querySelectorAll('details .decision-list li')].map((li) => li.textContent),
        ).toEqual([...projectCopy.decisions]);
        if (locale !== 'es') {
          expect(root.textContent).not.toContain(project.summary);
          expect(root.textContent).not.toContain(project.brand);
        }
      });
    }
  }

  it('keeps every detail text translated, without leaking the Spanish profile data', async () => {
    const harness = await RouterTestingHarness.create('/en/projects/smartfinance-pty');
    const repository = TestBed.inject(PortfolioRepository);
    for (const project of repository.getProfile().projects) {
      for (const locale of ['en', 'pt'] as const) {
        await harness.navigateByUrl(`/${locale}/projects/${project.slug}`);
        const text = harness.routeNativeElement!.querySelector('main')?.textContent ?? '';
        expect(text).not.toContain(project.summary);
        expect(text).toContain(repository.getProjectCopy(locale, project.id).detail);
      }
    }
  });

  it('cycles "next project" through the whole list in order and back to the first', async () => {
    const repository = TestBed.inject(PortfolioRepository);
    const projects = repository.getProfile().projects;
    const harness = await RouterTestingHarness.create(`/es/projects/${projects[0]!.slug}`);
    const visited = [projects[0]!.slug];
    for (let step = 0; step < projects.length; step++) {
      const next = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.detail-next')!;
      const expected = projects[(step + 1) % projects.length]!;
      expect(next.getAttribute('href')).toBe(`/es/projects/${expected.slug}`);
      expect(next.querySelector('.detail-next-name')?.textContent?.trim()).toBe(expected.name);
      next.click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/es/projects/${expected.slug}`);
      visited.push(expected.slug);
    }
    expect(visited.at(-2)).toBe('black-ninja');
    expect(visited.at(-1)).toBe('smartfinance-pty');
  });

  it('moves between cases and back to the listing', async () => {
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
