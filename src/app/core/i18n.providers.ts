import { isDevMode } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { PortfolioTranslationLoader } from '../data-access/portfolio-translation.loader';
import { DEFAULT_LOCALE, LOCALES } from '../domain/locale';
import { LocalizedTitleStrategy } from './localized-title.strategy';

export function providePortfolioI18n() {
  return [
    provideTransloco({
      config: {
        availableLangs: [...LOCALES],
        defaultLang: DEFAULT_LOCALE,
        fallbackLang: DEFAULT_LOCALE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        failedRetries: 0,
        missingHandler: { allowEmpty: false, useFallbackTranslation: true, logMissingKey: true },
      },
      loader: PortfolioTranslationLoader,
    }),
    { provide: TitleStrategy, useClass: LocalizedTitleStrategy },
  ];
}
