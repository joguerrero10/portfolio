import { inject } from '@angular/core';
import { CanActivateFn, PRIMARY_OUTLET, Router } from '@angular/router';
import { DEFAULT_LOCALE, isLocale } from '../domain/locale';
import { LanguageService } from './language.service';

export const localeGuard: CanActivateFn = (route, state) => {
  const locale = route.paramMap.get('lang');
  if (isLocale(locale)) return inject(LanguageService).load(locale);
  const router = inject(Router);
  const requested = router.parseUrl(state.url);
  const segments = requested.root.children[PRIMARY_OUTLET]?.segments ?? [];
  return router.createUrlTree([`/${DEFAULT_LOCALE}`, ...segments.slice(1).map((s) => s.path)], {
    queryParams: requested.queryParams,
    fragment: requested.fragment ?? undefined,
  });
};
