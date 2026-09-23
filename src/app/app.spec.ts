import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { providePortfolioI18n } from './core/i18n.providers';
import { routes } from './app.routes';
import { StaticPortfolioRepository } from './data-access/static-portfolio.repository';
import { LOCALES } from './domain/locale';
import { PortfolioRepository } from './domain/portfolio.repository';

describe('Portfolio navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        providePortfolioI18n(),
        provideRouter(routes, withComponentInputBinding()),
        { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
      ],
    });
  });

  it('boots the app and redirects the root to Spanish', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/es');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('misiones reales');
  });

  for (const locale of LOCALES) {
    for (const section of ['', 'experience', 'projects', 'skills', 'recruiter', 'contact']) {
      it(`resolves /${locale}/${section} with meaningful content`, async () => {
        const harness = await RouterTestingHarness.create(
          section ? `/${locale}/${section}` : `/${locale}`,
        );
        expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBeTruthy();
        expect(document.documentElement.lang).toBe(locale);
        const cv = harness.routeNativeElement?.querySelector('a[download]');
        if (['', 'recruiter', 'contact'].includes(section)) {
          expect(cv?.getAttribute('href')).toBe('/assets/cv/Joel_Guerrero_CV.pdf');
        } else {
          expect(cv).toBeNull();
        }
      });
    }
    for (const [slug, name] of [
      ['smartfinance-pty', 'SmartFinance Pty'],
      ['smartpos-pty', 'SmartPOS Pty'],
    ]) {
      it(`resolves /${locale}/projects/${slug}`, async () => {
        const harness = await RouterTestingHarness.create(`/${locale}/projects/${slug}`);
        expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(name);
      });
    }
  }

  it('normalizes unsupported languages without losing section or query', async () => {
    await RouterTestingHarness.create('/fr/projects?source=cv#architecture');
    expect(TestBed.inject(Router).url).toBe('/es/projects?source=cv#architecture');
  });

  it('keeps the current detail route and query when skipping to content', async () => {
    const harness = await RouterTestingHarness.create('/en/projects/smartpos-pty?source=cv');
    const skip = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('a[fragment]');
    expect(skip?.getAttribute('href')).toBe('/en/projects/smartpos-pty?source=cv#main-content');
    skip?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/en/projects/smartpos-pty?source=cv#main-content');
    expect(document.activeElement?.id).toBe('main-content');
  });

  it('updates content when the language route is reused', async () => {
    const harness = await RouterTestingHarness.create('/es/experience');
    await harness.navigateByUrl('/pt/experience');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Experiência');
    expect(document.documentElement.lang).toBe('pt');
  });

  it('marks home and project detail navigation as active without a trailing slash mismatch', async () => {
    const harness = await RouterTestingHarness.create('/es');
    const active = () =>
      harness.routeNativeElement?.querySelector('app-sidebar-nav a[aria-current="page"]');
    expect(active()?.textContent).toContain('Inicio');
    await harness.navigateByUrl('/es/projects/smartpos-pty');
    expect(active()?.textContent).toContain('Proyectos');
  });

  it('expands the menu in flow and closes it after navigation, focusing main', async () => {
    const harness = await RouterTestingHarness.create('/es');
    const root = harness.routeNativeElement!;
    const toggle = root.querySelector<HTMLButtonElement>(
      'button[aria-controls="mobile-navigation"]',
    )!;
    const panel = root.querySelector<HTMLElement>('#mobile-navigation')!;
    expect(panel.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await harness.fixture.whenStable();
    expect(panel.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    panel.querySelector<HTMLAnchorElement>('a[href="/es/projects"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/es/projects');
    expect(panel.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement?.id).toBe('main-content');
  });

  it('closes the expanded menu when changing language and preserves real link availability', async () => {
    const harness = await RouterTestingHarness.create('/es');
    const root = harness.routeNativeElement!;
    root.querySelector<HTMLButtonElement>('button[aria-controls="mobile-navigation"]')!.click();
    await harness.fixture.whenStable();
    root.querySelector<HTMLAnchorElement>('app-language-switcher a[hreflang="en"]')!.click();
    await harness.fixture.whenStable();
    expect(root.querySelector<HTMLElement>('#mobile-navigation')?.hidden).toBe(true);
    expect(document.documentElement.lang).toBe('en');
    const expectedLinks = Object.values(
      TestBed.inject(PortfolioRepository).getProfile().socials,
    ).filter((url) => url !== null);
    expect(
      [...root.querySelectorAll('footer .social-links a')].map((link) => link.getAttribute('href')),
    ).toEqual(expectedLinks);
  });

  it('renders unconfirmed social profiles as localized text without fake links', async () => {
    const repository = TestBed.inject(PortfolioRepository);
    const profile = repository.getProfile();
    vi.spyOn(repository, 'getProfile').mockReturnValue({
      ...profile,
      socials: { ...profile.socials, github: null, instagram: null },
    });
    const harness = await RouterTestingHarness.create('/pt/contact');
    const root = harness.routeNativeElement!;
    expect(root.querySelectorAll('footer .social-links a')).toHaveLength(1);
    expect(
      [...root.querySelectorAll('footer .pending-label')].map((item) => item.textContent?.trim()),
    ).toEqual(['Link pendente', 'Link pendente']);
  });

  it('keeps the sidebar motto inside a landmark', async () => {
    const harness = await RouterTestingHarness.create('/es');
    const sidebar = harness.routeNativeElement?.querySelector('app-sidebar-nav');
    expect(sidebar?.getAttribute('role')).toBe('complementary');
    expect(sidebar?.querySelector('.sidebar-motto')?.textContent?.trim()).toBeTruthy();
  });

  it('shows a localized not-found page for unknown routes', async () => {
    const harness = await RouterTestingHarness.create('/en/missing');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Page not found',
    );
  });

  it('rejects unknown project slugs', async () => {
    const harness = await RouterTestingHarness.create('/pt/projects/unknown');
    expect(TestBed.inject(Router).url).toBe('/pt/not-found');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Página não encontrada',
    );
  });
});
