import { inject, Service } from '@angular/core';
import { TranslocoLoader } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { isLocale } from '../domain/locale';
import { PortfolioRepository } from '../domain/portfolio.repository';

@Service()
export class PortfolioTranslationLoader implements TranslocoLoader {
  private readonly repository = inject(PortfolioRepository);

  getTranslation(lang: string) {
    if (!isLocale(lang))
      return throwError(() => new Error(`Unsupported translation locale: ${lang}`));
    return of({ portfolio: this.repository.getCopy(lang) });
  }
}
