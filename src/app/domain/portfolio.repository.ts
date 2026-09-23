import { Locale } from './locale';
import { Experience, Profile } from './portfolio.models';
import { PortfolioCopy } from './portfolio-copy';

export abstract class PortfolioRepository {
  abstract getProfile(): Profile;
  abstract getCopy(locale: Locale): PortfolioCopy;
  abstract getExperiences(locale: Locale): readonly Experience[];
  abstract getSkills(): readonly (readonly string[])[];
}
