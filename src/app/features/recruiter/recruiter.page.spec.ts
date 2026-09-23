import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

describe('Recruiter summary', () => {
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
    it(`summarizes ${locale} profile, experience, stack, projects, education and CV`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/recruiter`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const profile = repository.getProfile();
      const jobs = repository.getExperiences(locale);

      expect(root.querySelector('h1')?.textContent).toContain(copy.quick);
      expect(root.querySelector('.eyebrow')?.textContent?.trim()).toBe(copy.quickTitle);
      expect(root.querySelector('.section-description')?.textContent).toContain(copy.quickDesc);

      const facts = [...root.querySelectorAll('.fact')].map((fact) => fact.textContent);
      expect(facts[0]).toContain(copy.role);
      expect(facts[1]).toContain(copy.years);
      expect(facts[2]).toContain(profile.email);
      expect(facts[2]).toContain(copy.location);
      expect(root.querySelector('.fact a')?.getAttribute('href')).toBe(`mailto:${profile.email}`);

      expect([...root.querySelectorAll('.journey-item')].map((item) => item.textContent)).toEqual(
        jobs.map((job) => `${job.period}${job.role}${job.employer}`),
      );
      expect(root.querySelector('.block-link')?.getAttribute('href')).toBe(`/${locale}/experience`);

      const groups = [...root.querySelectorAll('.stack-group')];
      expect(
        groups.map((group) => group.querySelector('.stack-label')?.textContent?.trim()),
      ).toEqual([...copy.skillLabels]);
      expect(
        groups.map((group) => group.querySelector('.stack-items')?.textContent?.trim()),
      ).toEqual(repository.getSkills().map((group) => group.join(' · ')));

      // Both projects keep their real status on the recruiter view.
      expect(
        [...root.querySelectorAll('app-featured-missions .mission-status')].map((status) =>
          status.textContent?.trim(),
        ),
      ).toEqual([copy.live, copy.building]);

      expect([...root.querySelectorAll('.education li')].map((item) => item.textContent)).toEqual([
        ...copy.educationList,
      ]);
      expect(root.querySelector('.education-languages')?.textContent).toContain(copy.languageText);

      const download = root.querySelector<HTMLAnchorElement>('.cv-block a[download]')!;
      expect(download.getAttribute('href')).toBe(profile.cv.path);
      expect(download.getAttribute('aria-label')).toBe(copy.a11y.downloadCv);
      expect(root.querySelector('.cv-original')?.textContent?.trim()).toBe(copy.original);

      const headings = [...root.querySelectorAll('main h1, main h2, main h3')].map(
        (heading) => heading.tagName,
      );
      expect(headings).toEqual(['H1', 'H2', 'H2', 'H2', 'H3', 'H3', 'H2', 'H2']);
    });
  }

  it('does not promise certifications, metrics or finished studies', async () => {
    const harness = await RouterTestingHarness.create('/es/recruiter');
    const text = harness.routeNativeElement!.textContent ?? '';
    expect(text).toContain('Especialización en Docencia Superior (en curso)');
    expect(text).toContain('Licenciatura en Ciberseguridad — Universidad Tecnológica de Panamá');
    expect(text).not.toMatch(/TOGAF|certificad|SLA|%/i);
  });
});
