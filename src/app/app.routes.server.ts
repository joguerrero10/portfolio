import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { LOCALES } from './domain/locale';
import { PortfolioRepository } from './domain/portfolio.repository';

const sections = ['', 'experience', 'projects', 'skills', 'recruiter', 'contact', 'not-found'];

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  ...sections.map((section): ServerRoute => ({
    path: section ? `:lang/${section}` : ':lang',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return LOCALES.map((lang) => ({ lang }));
    },
  })),
  {
    path: ':lang/projects/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const projects = inject(PortfolioRepository).getProfile().projects;
      return LOCALES.flatMap((lang) => projects.map(({ slug }) => ({ lang, slug })));
    },
  },
  { path: '**', renderMode: RenderMode.Client },
];
