import { inject, Service } from '@angular/core';
import { Locale, LOCALES } from '../domain/locale';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { Project, ProjectStatus, SocialLink } from '../domain/portfolio.models';
import { resolveOrigin } from '../domain/site';
import site from '../../../content/site.json';

const CORE_TECHNOLOGIES = ['AWS', 'Azure', 'OCI', 'Terraform'] as const;
const FEATURED_LIMIT = 3;
const STATUS_LABELS = {
  published: 'live',
  'in-development': 'building',
  completed: 'finished',
} as const satisfies Record<ProjectStatus, string>;

@Service()
export class PortfolioFacade {
  private readonly repository = inject(PortfolioRepository);
  readonly profile = this.repository.getProfile();
  readonly origin = resolveOrigin(site);
  readonly projects = this.profile.projects;
  readonly featuredProjects = this.projects.slice(0, FEATURED_LIMIT);
  readonly coreTechnologies: readonly string[] = CORE_TECHNOLOGIES.map((name) => {
    if (!this.repository.getSkills().some((group) => group.includes(name))) {
      throw new Error(`Core technology missing from content/skills.json: ${name}`);
    }
    return name;
  });
  readonly socials: readonly SocialLink[] = [
    { platform: 'linkedin', url: this.profile.socials.linkedin },
    { platform: 'github', url: this.profile.socials.github },
    { platform: 'instagram', url: this.profile.socials.instagram },
  ];

  constructor() {
    for (const locale of LOCALES) {
      for (const project of this.projects) this.repository.getProjectCopy(locale, project.id);
    }
  }

  getCopy(locale: Locale) {
    return this.repository.getCopy(locale);
  }

  getProject(slug: string) {
    return this.projects.find((project) => project.slug === slug);
  }

  getProjectCopy(locale: Locale, project: Project) {
    return this.repository.getProjectCopy(locale, project.id);
  }

  statusLabel(locale: Locale, project: Project) {
    return this.repository.getCopy(locale)[STATUS_LABELS[project.status]];
  }

  nextProject(slug: string) {
    const index = this.projects.findIndex((project) => project.slug === slug);
    if (index === -1 || this.projects.length < 2) return undefined;
    return this.projects[(index + 1) % this.projects.length];
  }

  getExperiences(locale: Locale) {
    return this.repository.getExperiences(locale);
  }

  getSkills() {
    return this.repository.getSkills();
  }
}
