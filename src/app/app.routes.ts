import { Routes } from '@angular/router';
import { localeGuard } from './core/locale.guard';
import { projectGuard } from './core/project.guard';
import { PageKey } from './core/localized-title.strategy';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'es' },
  {
    path: ':lang',
    canActivate: [localeGuard],
    loadComponent: () => import('./layout/locale-layout/locale-layout').then((m) => m.LocaleLayout),
    children: [
      {
        path: '',
        data: { page: 'home' satisfies PageKey },
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'experience',
        data: { page: 'experience' satisfies PageKey },
        loadComponent: () =>
          import('./features/experience/experience.page').then((m) => m.ExperiencePage),
      },
      {
        path: 'projects',
        data: { page: 'projects' satisfies PageKey },
        loadComponent: () =>
          import('./features/projects/projects.page').then((m) => m.ProjectsPage),
      },
      {
        path: 'projects/:slug',
        data: { page: 'projectDetail' satisfies PageKey },
        canActivate: [projectGuard],
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.page').then(
            (m) => m.ProjectDetailPage,
          ),
      },
      {
        path: 'skills',
        data: { page: 'skills' satisfies PageKey },
        loadComponent: () => import('./features/skills/skills.page').then((m) => m.SkillsPage),
      },
      {
        path: 'recruiter',
        data: { page: 'recruiter' satisfies PageKey },
        loadComponent: () =>
          import('./features/recruiter/recruiter.page').then((m) => m.RecruiterPage),
      },
      {
        path: 'contact',
        data: { page: 'contact' satisfies PageKey },
        loadComponent: () => import('./features/contact/contact.page').then((m) => m.ContactPage),
      },
      {
        path: 'not-found',
        data: { page: 'notFound' satisfies PageKey },
        loadComponent: () =>
          import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
      {
        path: '**',
        data: { page: 'notFound' satisfies PageKey },
        loadComponent: () =>
          import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
