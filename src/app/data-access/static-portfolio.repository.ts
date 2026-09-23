import { Service } from '@angular/core';
import profile from '../../../content/profile.json';
import skills from '../../../content/skills.json';
import es from '../../../content/es.json';
import en from '../../../content/en.json';
import pt from '../../../content/pt.json';
import { Locale } from '../domain/locale';
import { PortfolioCopy } from '../domain/portfolio-copy';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { Experience } from '../domain/portfolio.models';
import { mapProfile } from './profile.mapper';

const copies = { es, en, pt } satisfies Record<Locale, PortfolioCopy>;

@Service()
export class StaticPortfolioRepository extends PortfolioRepository {
  private readonly profile = mapProfile(profile);

  override getProfile() {
    return this.profile;
  }

  override getCopy(locale: Locale): PortfolioCopy {
    return copies[locale];
  }

  override getExperiences(locale: Locale): readonly Experience[] {
    return this.getCopy(locale).jobs.map((job) => {
      if (!job.role || !job.employer || !job.period || !job.summary) {
        throw new Error(`Incomplete experience in content/${locale}.json`);
      }
      for (const step of job.roles) {
        if (!step.role || !step.period) {
          throw new Error(`Incomplete role progression in content/${locale}.json`);
        }
      }
      return { ...job };
    });
  }

  override getSkills(): readonly (readonly string[])[] {
    return skills;
  }
}
