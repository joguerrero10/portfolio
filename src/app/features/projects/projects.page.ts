import { Component, inject } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { FeatureIntro } from '../../shared/ui/feature-intro/feature-intro';
import { ProjectCard } from '../../shared/ui/project-card/project-card';

@Component({
  selector: 'app-projects-page',
  imports: [FeatureIntro, ProjectCard],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss',
})
export class ProjectsPage {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
}
