import { TestBed } from '@angular/core/testing';
import profile from '../../../content/profile.json';
import { PortfolioFacade } from '../core/portfolio.facade';
import { LOCALES } from '../domain/locale';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { mapProfile } from './profile.mapper';
import { StaticPortfolioRepository } from './static-portfolio.repository';

describe('Static portfolio content', () => {
  it('preserves supplied facts and unconfirmed links', () => {
    const mapped = mapProfile(profile);
    expect(mapped).toEqual(profile);
    const withoutLinks = mapProfile({
      ...profile,
      socials: { ...profile.socials, github: null, instagram: null },
    });
    expect(withoutLinks.socials.github).toBeNull();
    expect(withoutLinks.socials.instagram).toBeNull();
    expect(mapped.projects.find((project) => project.id === 'smartpos')?.demoUrl).toBeNull();
    expect(mapped.projects.map((project) => [project.id, project.status])).toEqual([
      ['smartfinance', 'published'],
      ['smartpos', 'in-development'],
      ['omnisphere-ai', 'in-development'],
      ['helpdesk-ai', 'in-development'],
      ['world-cup-predictor', 'in-development'],
      ['black-ninja', 'completed'],
    ]);
    expect(mapped.projects.slice(2).map((project) => project.repositoryUrl)).toEqual([
      'https://github.com/joguerrero10/omniSphere_ai',
      'https://github.com/joguerrero10/helpdesk-ai-automation',
      'https://github.com/joguerrero10/world-cup-predictor',
      'https://github.com/joguerrero10/black_ninja',
    ]);
    const repository = new StaticPortfolioRepository();
    for (const project of mapped.projects.slice(2)) {
      expect(project.demoUrl).toBeNull();
      expect(project.technicalDetailsConfirmed).toBe(true);
      expect(project.technologies!.length).toBeLessThanOrEqual(10);
      for (const locale of LOCALES) {
        const { architecture } = repository.getProjectCopy(locale, project.id);
        expect(architecture.length).toBeGreaterThanOrEqual(3);
        expect(architecture.length).toBeLessThanOrEqual(5);
      }
    }
    expect(mapped.cv.locale).toBe('es');
  });

  it('maps experience content in each language without inventing employers or dates', () => {
    const repository = new StaticPortfolioRepository();
    for (const locale of LOCALES) {
      const experiences = repository.getExperiences(locale);
      expect(experiences).toEqual(repository.getCopy(locale).jobs);
      expect(experiences.map((job) => job.employer)).toEqual([
        'Ficohsa S.A.',
        'Banistmo',
        'Banco General · Yappy',
      ]);
      expect(experiences.map((job) => job.roles.length)).toEqual([0, 0, 3]);
      expect(experiences.at(-1)?.roles.map((step) => step.period)).toEqual(
        locale === 'en'
          ? ['Aug 2022 — Jun 2023', 'Jan 2022 — Aug 2022', 'Jan 2021 — Dec 2021']
          : [
              'Ago 2022 — Jun 2023',
              locale === 'es' ? 'Ene 2022 — Ago 2022' : 'Jan 2022 — Ago 2022',
              locale === 'es' ? 'Ene 2021 — Dic 2021' : 'Jan 2021 — Dez 2021',
            ],
      );
    }
  });

  it('rejects incomplete experience rows and unreal CV sizes', () => {
    const repository = new StaticPortfolioRepository();
    vi.spyOn(repository, 'getCopy').mockReturnValue({
      ...repository.getCopy('es'),
      jobs: [
        {
          role: 'Rol',
          employer: '',
          location: 'Ciudad de Panamá',
          period: 'Mar 2024 — Sep 2026',
          summary: 'Resumen',
          roles: [],
        },
      ],
    });
    expect(() => repository.getExperiences('es')).toThrowError(/Incomplete experience/);
    expect(() => mapProfile({ ...profile, cv: { ...profile.cv, bytes: 0 } })).toThrowError(
      /real byte count/,
    );
  });

  it('rejects unsafe links and path traversal', () => {
    expect(() =>
      mapProfile({ ...profile, socials: { ...profile.socials, github: 'javascript:alert(1)' } }),
    ).toThrow();
    expect(() =>
      mapProfile({ ...profile, cv: { ...profile.cv, path: '/assets/../private.pdf' } }),
    ).toThrow();
  });

  it('rejects invalid status, duplicate slugs and unsupported CV languages', () => {
    expect(() =>
      mapProfile({ ...profile, projects: profile.projects.map((p) => ({ ...p, status: 'fake' })) }),
    ).toThrow();
    expect(() =>
      mapProfile({ ...profile, projects: [...profile.projects, ...profile.projects] }),
    ).toThrow();
    expect(() => mapProfile({ ...profile, cv: { ...profile.cv, locale: 'fr' } })).toThrow();
  });

  it('reads project copy by id and fails fast when an id has none', () => {
    const repository = new StaticPortfolioRepository();
    for (const locale of LOCALES) {
      for (const project of repository.getProfile().projects) {
        const entry = repository.getProjectCopy(locale, project.id);
        expect(entry).toBe(repository.getCopy(locale).projectCopy[project.id]);
        expect(entry.decisions.length).toBeGreaterThan(0);
      }
      expect(() => repository.getProjectCopy(locale, 'missing-copy')).toThrowError(
        `Missing or incomplete projectCopy.missing-copy in content/${locale}.json`,
      );
      expect(() => repository.getProjectCopy(locale, 'constructor')).toThrowError(/projectCopy/);
    }

    TestBed.configureTestingModule({
      providers: [{ provide: PortfolioRepository, useExisting: StaticPortfolioRepository }],
    });
    const injected = TestBed.inject(PortfolioRepository);
    const profile = injected.getProfile();
    vi.spyOn(injected, 'getProfile').mockReturnValue({
      ...profile,
      projects: [...profile.projects, { ...profile.projects[0]!, id: 'missing-copy', slug: 'x' }],
    });
    expect(() => TestBed.runInInjectionContext(() => new PortfolioFacade())).toThrowError(
      /projectCopy\.missing-copy in content\/es\.json/,
    );
  });

  it('only labels SmartNova products as such and gives every status a translated label', () => {
    const repository = new StaticPortfolioRepository();
    for (const locale of LOCALES) {
      const copy = repository.getCopy(locale);
      for (const project of repository.getProfile().projects) {
        const origin = repository.getProjectCopy(locale, project.id).origin;
        expect(origin.includes('SmartNova')).toBe(project.brand === 'SmartNova');
      }
      expect(new Set([copy.live, copy.building, copy.finished]).size).toBe(3);
    }
  });

  it('uses the injected repository through the facade', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PortfolioRepository, useExisting: StaticPortfolioRepository }],
    });
    const facade = TestBed.inject(PortfolioFacade);
    expect(facade.getProject('smartfinance-pty')?.name).toBe('SmartFinance Pty');
    expect(facade.getProject('unknown')).toBeUndefined();
    expect(facade.socials.filter((link) => link.url !== null).map((link) => link.platform)).toEqual(
      Object.entries(profile.socials)
        .filter(([, url]) => url !== null)
        .map(([platform]) => platform),
    );
  });
});
