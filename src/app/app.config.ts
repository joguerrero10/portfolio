import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { PortfolioRepository } from './domain/portfolio.repository';
import { StaticPortfolioRepository } from './data-access/static-portfolio.repository';
import { providePortfolioI18n } from './core/i18n.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    providePortfolioI18n(),
    { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
  ],
};
