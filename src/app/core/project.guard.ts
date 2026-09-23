import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DEFAULT_LOCALE, isLocale } from '../domain/locale';
import { PortfolioFacade } from './portfolio.facade';

export const projectGuard: CanActivateFn = (route) => {
  if (inject(PortfolioFacade).getProject(route.paramMap.get('slug') ?? '')) return true;
  const lang = route.parent?.paramMap.get('lang');
  return inject(Router).createUrlTree([isLocale(lang) ? lang : DEFAULT_LOCALE, 'not-found']);
};
