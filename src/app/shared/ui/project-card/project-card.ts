import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../../core/locale-context';
import { PortfolioFacade } from '../../../core/portfolio.facade';
import { Project } from '../../../domain/portfolio.models';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-project-card',
  imports: [Icon, RouterLink],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  host: { class: 'mission' },
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly level = input<2 | 3>(3);
  protected readonly context = inject(LocaleContext);
  private readonly portfolio = inject(PortfolioFacade);
  protected readonly projectCopy = computed(() =>
    this.portfolio.getProjectCopy(this.context.locale(), this.project()),
  );
  protected readonly status = computed(() =>
    this.portfolio.statusLabel(this.context.locale(), this.project()),
  );
}
