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
    expect(mapped.projects.map((project) => project.status)).toEqual([
      'published',
      'in-development',
    ]);
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
          period: 'Mar 2024 — Actualidad',
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
