import { Locale } from './locale';
import { Experience, Profile, ProjectCopy } from './portfolio.models';
import { PortfolioCopy } from './portfolio-copy';

export abstract class PortfolioRepository {
  abstract getProfile(): Profile;
  abstract getCopy(locale: Locale): PortfolioCopy;
  abstract getProjectCopy(locale: Locale, projectId: string): ProjectCopy;
  abstract getExperiences(locale: Locale): readonly Experience[];
  abstract getSkills(): readonly (readonly string[])[];
}
