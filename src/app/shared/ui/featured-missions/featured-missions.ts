import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../../core/locale-context';
import { PortfolioFacade } from '../../../core/portfolio.facade';
import { Icon } from '../icon/icon';
import { ProjectCard } from '../project-card/project-card';

@Component({
  selector: 'app-featured-missions',
  imports: [Icon, ProjectCard, RouterLink],
  templateUrl: './featured-missions.html',
  styleUrl: './featured-missions.scss',
})
export class FeaturedMissions {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
}
