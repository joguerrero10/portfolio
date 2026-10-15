import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../../core/locale-context';
import { PortfolioFacade } from '../../../core/portfolio.facade';
import { Project } from '../../../domain/portfolio.models';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-project-detail-page',
  templateUrl: './project-detail.page.html',
  styleUrl: './project-detail.page.scss',
  imports: [Button, Icon, RouterLink],
})
export class ProjectDetailPage {
  readonly slug = input.required<string>();
  protected readonly context = inject(LocaleContext);
  private readonly portfolio = inject(PortfolioFacade);
  protected readonly project = computed(() => this.portfolio.getProject(this.slug()));
  protected readonly next = computed(() => this.portfolio.nextProject(this.slug()));

  protected projectCopy(project: Project) {
    return this.portfolio.getProjectCopy(this.context.locale(), project);
  }

  protected status(project: Project) {
    return this.portfolio.statusLabel(this.context.locale(), project);
  }
}
