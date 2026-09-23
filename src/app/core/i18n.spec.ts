import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { routes } from '../app.routes';
import { PortfolioTranslationLoader } from '../data-access/portfolio-translation.loader';
import { StaticPortfolioRepository } from '../data-access/static-portfolio.repository';
import { LOCALES } from '../domain/locale';
import { PortfolioCopy } from '../domain/portfolio-copy';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { providePortfolioI18n } from './i18n.providers';
import { LanguageService, LOCALE_PREFERENCE_KEY } from './language.service';

describe('URL-driven internationalization', () => {
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
    localStorage.removeItem(LOCALE_PREFERENCE_KEY);
    vi.restoreAllMocks();
  });

  for (const locale of LOCALES) {
    it(`loads every ${locale} text deterministically without losing arrays or confirmed facts`, async () => {
      const service = TestBed.inject(TranslocoService);
      await firstValueFrom(TestBed.inject(LanguageService).load(locale));
      const copy = service.translateObject<PortfolioCopy>('portfolio', {}, locale);
      expect(copy).toEqual(TestBed.inject(PortfolioRepository).getCopy(locale));
      expect(copy.languageText).toContain('A2');
      expect(copy.languageText).toContain('A1');
      expect(TestBed.inject(PortfolioRepository).getProfile().cv.locale).toBe('es');
    });

    it(`uses the explicit ${locale} URL despite a conflicting saved preference and localizes metadata`, async () => {
      localStorage.setItem(LOCALE_PREFERENCE_KEY, locale === 'es' ? 'pt' : 'es');
      const harness = await RouterTestingHarness.create(`/${locale}/experience`);
      const copy = TestBed.inject(PortfolioRepository).getCopy(locale);
      expect(document.documentElement.lang).toBe(locale);
      expect(TestBed.inject(TranslocoService).getActiveLang()).toBe(locale);
      expect(document.title).toBe(`${copy.seo.experience} — Joel Guerrero`);
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        copy.experienceIntro,
      );
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
        document.title,
      );
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
        copy.experienceTitle,
      );
    });
  }

  it('preserves detail slug, matrix parameters, query and fragment through ES → EN → PT', async () => {
    const harness = await RouterTestingHarness.create(
      '/es/projects/smartpos-pty;view=architecture?source=cv#details',
    );
    for (const locale of ['en', 'pt'] as const) {
      const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>(
        `app-language-switcher a[hreflang="${locale}"]`,
      )!;
      const url = `/${locale}/projects/smartpos-pty;view=architecture?source=cv#details`;
      expect(link.getAttribute('href')).toBe(url);
      link.click();
      await harness.fixture.whenStable();
      const copy = TestBed.inject(PortfolioRepository).getCopy(locale);
      expect(TestBed.inject(Router).url).toBe(url);
      expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('SmartPOS Pty');
      expect(harness.routeNativeElement!.querySelector('main')?.textContent).toContain(
        copy.building,
      );
      expect(document.title).toBe(`SmartPOS Pty · ${copy.seo.projectDetail} — Joel Guerrero`);
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        copy.posDetail,
      );

      expect(localStorage.getItem(LOCALE_PREFERENCE_KEY)).toBe(locale);
    }
  });

  it('refreshes language links when navigating within the same locale', async () => {
    const harness = await RouterTestingHarness.create('/es');
    await harness.navigateByUrl('/es/projects/smartfinance-pty');
    expect(
      harness
        .routeNativeElement!.querySelector('app-language-switcher a[hreflang="pt"]')
        ?.getAttribute('href'),
    ).toBe('/pt/projects/smartfinance-pty');
  });

  it('keeps root Spanish and normalizes an unsupported URL even with Portuguese saved', async () => {
    localStorage.setItem(LOCALE_PREFERENCE_KEY, 'pt');
    const harness = await RouterTestingHarness.create('/');
    expect(TestBed.inject(Router).url).toBe('/es');
    await harness.navigateByUrl('/fr/projects/smartfinance-pty?ref=cv#details');
    expect(TestBed.inject(Router).url).toBe('/es/projects/smartfinance-pty?ref=cv#details');
    expect(document.documentElement.lang).toBe('es');
  });

  it('does not access browser storage during server rendering', async () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    const language = TestBed.inject(LanguageService);
    await firstValueFrom(language.load('pt'));
    language.commit('pt');
    expect(storage).not.toHaveBeenCalled();
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('pt');
  });

  it('keeps navigation working when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    const harness = await RouterTestingHarness.create('/pt/contact');
    expect(document.documentElement.lang).toBe('pt');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Vamos construir',
    );
  });

  it('rejects unsupported loader locales rather than fetching an arbitrary URL', async () => {
    await expect(
      firstValueFrom(TestBed.inject(PortfolioTranslationLoader).getTranslation('fr')),
    ).rejects.toThrow('Unsupported translation locale');
  });
});
