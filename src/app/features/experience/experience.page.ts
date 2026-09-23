import { Component, computed, inject } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { FeatureIntro } from '../../shared/ui/feature-intro/feature-intro';

@Component({
  selector: 'app-experience-page',
  imports: [FeatureIntro],
  templateUrl: './experience.page.html',
  styleUrl: './experience.page.scss',
})
export class ExperiencePage {
  protected readonly context = inject(LocaleContext);
  private readonly portfolio = inject(PortfolioFacade);
  protected readonly experiences = computed(() =>
    this.portfolio.getExperiences(this.context.locale()),
  );
}
