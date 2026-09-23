import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

describe('Contact, profiles and files', () => {
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
    it(`offers the ${locale} email, profiles and CV with real targets`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/contact`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const profile = repository.getProfile();

      expect(root.querySelector('h1')?.textContent).toContain(copy.contactTitle);

      const mail = root.querySelector<HTMLAnchorElement>('.contact-mail')!;
      expect(mail.getAttribute('href')).toBe(
        `mailto:${profile.email}?subject=${encodeURIComponent(copy.mailSubject)}`,
      );
      expect(mail.getAttribute('href')).not.toContain(' ');
      expect(mail.textContent?.trim()).toBe(copy.email);
      expect(root.querySelector('.contact-address')?.textContent?.trim()).toBe(profile.email);
      expect(root.querySelector('form')).toBeNull();

      const social = [...root.querySelectorAll<HTMLAnchorElement>('.social-link')];
      expect(social.map((link) => link.getAttribute('href'))).toEqual(
        Object.values(profile.socials).filter((url) => url !== null),
      );
      for (const link of social) {
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('aria-label')).toContain(copy.a11y.externalLink);
        expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      }

      const download = root.querySelector<HTMLAnchorElement>('a[download]')!;
      expect(download.getAttribute('href')).toBe(profile.cv.path);
      expect(download.getAttribute('aria-label')).toBe(copy.a11y.downloadCv);
      expect(root.textContent).toContain(copy.original);
    });
  }

  it('keeps the CV reachable from home, recruiter and contact', async () => {
    const harness = await RouterTestingHarness.create('/es');
    const repository = TestBed.inject(PortfolioRepository);
    const profile = repository.getProfile();
    for (const route of ['/es', '/es/recruiter', '/es/contact']) {
      await harness.navigateByUrl(route);
      const download =
        harness.routeNativeElement!.querySelector<HTMLAnchorElement>('main a[download]')!;
      expect(download.getAttribute('href')).toBe(profile.cv.path);
      expect(download.getAttribute('download')).toBe('Joel_Guerrero_CV.pdf');
      expect(download.getAttribute('aria-label')).toBe(repository.getCopy('es').a11y.downloadCv);
    }
  });

  it('describes pending profiles without fake links', async () => {
    const repository = TestBed.inject(PortfolioRepository);
    const profile = repository.getProfile();
    vi.spyOn(repository, 'getProfile').mockReturnValue({
      ...profile,
      socials: { ...profile.socials, github: null, instagram: null },
    });
    const harness = await RouterTestingHarness.create('/en/contact');
    const root = harness.routeNativeElement!;
    const copy = repository.getCopy('en');

    expect(root.querySelectorAll('.social-link')).toHaveLength(1);
    const pending = [...root.querySelectorAll('main .social-pending')];
    expect(pending).toHaveLength(2);
    expect(
      pending.map((item) => item.querySelector('.pending-label')?.textContent?.trim()),
    ).toEqual([copy.socialPending, copy.socialPending]);
    expect(pending.map((item) => item.querySelector('.pending-note')?.textContent?.trim())).toEqual(
      [copy.pending, copy.pending],
    );
    expect(pending.some((item) => item.querySelector('a'))).toBe(false);
    for (const link of root.querySelectorAll('main a')) {
      const href = link.getAttribute('href') ?? '';
      expect(href).not.toBe('#');
      expect(href).not.toMatch(/^https?:\/\/(www\.)?(linkedin|github|instagram)\.com\/?$/);
    }
  });
});
