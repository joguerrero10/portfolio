import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../core/locale-context';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { Button } from '../../shared/ui/button/button';
import { FeatureIntro } from '../../shared/ui/feature-intro/feature-intro';
import { FeaturedMissions } from '../../shared/ui/featured-missions/featured-missions';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-recruiter-page',
  imports: [Button, FeatureIntro, FeaturedMissions, Icon, RouterLink],
  templateUrl: './recruiter.page.html',
  styleUrl: './recruiter.page.scss',
})
export class RecruiterPage {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
  protected readonly experiences = computed(() =>
    this.portfolio.getExperiences(this.context.locale()),
  );
  // The published PDF is the source: its size comes from the file, not from an estimate.
  protected readonly cvSize = Math.round(this.portfolio.profile.cv.bytes / 1024);
  protected readonly skills = this.portfolio.getSkills();
}
