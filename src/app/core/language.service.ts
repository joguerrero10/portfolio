import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { forkJoin, map } from 'rxjs';
import { DEFAULT_LOCALE, Locale } from '../domain/locale';

export const LOCALE_PREFERENCE_KEY = 'portfolio.locale';

@Service()
export class LanguageService {
  private readonly translations = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  load(locale: Locale) {
    // The guard waits for both dictionaries before creating/reusing the routed view.
    return forkJoin([this.translations.load(DEFAULT_LOCALE), this.translations.load(locale)]).pipe(
      map(() => true),
    );
  }

  commit(locale: Locale) {
    this.translations.setActiveLang(locale);
    this.document.documentElement.lang = locale;
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      this.document.defaultView?.localStorage.setItem(LOCALE_PREFERENCE_KEY, locale);
    } catch {
      // Persistence is optional (private mode/blocked storage); URL and rendering stay authoritative.
    }
  }
}
