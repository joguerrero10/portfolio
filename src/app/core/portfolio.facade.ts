import { inject, Service } from '@angular/core';
import { Locale } from '../domain/locale';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { SocialLink } from '../domain/portfolio.models';
import { resolveOrigin } from '../domain/site';
import site from '../../../content/site.json';

// Featured on Home; the names must exist in content/skills.json, which stays the source of truth.
const CORE_TECHNOLOGIES = ['AWS', 'Azure', 'OCI', 'Terraform'] as const;

@Service()
export class PortfolioFacade {
  private readonly repository = inject(PortfolioRepository);
  readonly profile = this.repository.getProfile();
  readonly origin = resolveOrigin(site);
  readonly projects = this.profile.projects;
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

  getCopy(locale: Locale) {
    return this.repository.getCopy(locale);
  }

  getProject(slug: string) {
    return this.projects.find((project) => project.slug === slug);
  }

  getExperiences(locale: Locale) {
    return this.repository.getExperiences(locale);
  }

  getSkills() {
    return this.repository.getSkills();
  }
}
