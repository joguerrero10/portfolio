import { computed, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DEFAULT_LOCALE, isLocale } from '../domain/locale';
import { TranslocoService } from '@jsverse/transloco';
import { PortfolioCopy } from '../domain/portfolio-copy';

@Service({ autoProvided: false })
export class LocaleContext {
  private readonly route = inject(ActivatedRoute);
  private readonly translations = inject(TranslocoService);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly locale = computed(() => {
    const value = this.params().get('lang');
    return isLocale(value) ? value : DEFAULT_LOCALE;
  });
  readonly copy = computed(() =>
    this.translations.translateObject<PortfolioCopy>('portfolio', {}, this.locale()),
  );
}
