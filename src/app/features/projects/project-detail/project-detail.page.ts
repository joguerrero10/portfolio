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
  protected readonly other = computed(() =>
    this.portfolio.projects.find((item) => item.slug !== this.slug()),
  );

  // Every label below comes from the dictionaries; unknown projects fall back to their own data.
  protected category(project: Project) {
    const copy = this.context.copy();
    if (project.id === 'smartfinance') return copy.finance;
    if (project.id === 'smartpos') return copy.pos;
    return project.brand;
  }

  protected description(project: Project) {
    const copy = this.context.copy();
    if (project.id === 'smartfinance') return copy.financeDetail;
    if (project.id === 'smartpos') return copy.posDetail;
    return project.summary;
  }

  protected role(project: Project) {
    const copy = this.context.copy();
    if (project.id === 'smartfinance') return copy.architect;
    if (project.id === 'smartpos') return copy.architectPos;
    return project.role;
  }

  protected status(project: Project) {
    const copy = this.context.copy();
    return project.status === 'published' ? copy.live : copy.building;
  }

  protected decisions(project: Project): readonly string[] {
    if(project.id === 'smartfinance'){
      return this.context.copy().financeDecisions;
    }
    return project.id === 'smartpos' ? this.context.copy().posDecisions : [];
  }
}
