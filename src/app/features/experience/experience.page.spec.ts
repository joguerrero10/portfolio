import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

describe('Experience timeline', () => {
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
    it(`lists the ${locale} career path with employers, dates and progression`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/experience`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const jobs = repository.getExperiences(locale);

      expect(root.querySelector('h1')?.textContent).toContain(copy.experienceTitle);
      expect(root.querySelector('h2')?.textContent?.trim()).toBe(copy.journey);

      const items = [...root.querySelectorAll('.timeline-item')];
      expect(items).toHaveLength(jobs.length);
      expect(
        items.map((item) => item.querySelector('.timeline-role')?.textContent?.trim()),
      ).toEqual(jobs.map((job) => job.role));
      expect(
        items.map((item) => item.querySelector('.timeline-period')?.textContent?.trim()),
      ).toEqual(jobs.map((job) => job.period));
      expect(
        items.map((item) => item.querySelector('.timeline-employer')?.textContent?.trim()),
      ).toEqual(jobs.map((job) => `${job.employer} · ${job.location}`));
      expect(
        items.map((item) => item.querySelector('.timeline-summary')?.textContent?.trim()),
      ).toEqual(jobs.map((job) => job.summary));

      // Only the Banco General · Yappy stage has sub-roles, with the exact CV dates.
      const progressions = [...root.querySelectorAll('.timeline-progression')];
      expect(progressions).toHaveLength(1);
      const steps = [...progressions[0]!.querySelectorAll('.progression-item')];
      expect(
        steps.map((step) => step.querySelector('.progression-period')?.textContent?.trim()),
      ).toEqual(jobs.at(-1)!.roles.map((role) => role.period));
      expect(
        steps.map((step) => step.querySelector('.progression-role')?.textContent?.trim()),
      ).toEqual(jobs.at(-1)!.roles.map((role) => role.role));

      const headings = [...root.querySelectorAll('main h1, main h2, main h3')].map(
        (heading) => heading.tagName,
      );
      expect(headings).toEqual(['H1', 'H2', 'H3', 'H3', 'H3']);
    });
  }

  it('shows the localized empty state when there is no experience content', async () => {
    const repository = TestBed.inject(PortfolioRepository);
    vi.spyOn(repository, 'getExperiences').mockReturnValue([]);
    const harness = await RouterTestingHarness.create('/pt/experience');
    expect(harness.routeNativeElement?.querySelector('.timeline-empty')?.textContent?.trim()).toBe(
      repository.getCopy('pt').empty.experience,
    );
  });
});
