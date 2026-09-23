import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../../core/locale-context';
import { Project } from '../../../domain/portfolio.models';
import { Icon } from '../icon/icon';

// Shared card for the home missions, the projects list and any future listing.
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
  // Supplied projects have translated labels; any other project falls back to its own data.
  protected readonly category = computed(() => {
    const copy = this.context.copy();
    if (this.project().id === 'smartfinance') return copy.finance;
    if (this.project().id === 'smartpos') return copy.pos;
    return this.project().brand;
  });
  protected readonly summary = computed(() => {
    const copy = this.context.copy();
    if (this.project().id === 'smartfinance') return copy.financeDesc;
    if (this.project().id === 'smartpos') return copy.posDesc;
    return this.project().summary;
  });
  protected readonly status = computed(() => {
    const copy = this.context.copy();
    return this.project().status === 'published' ? copy.live : copy.building;
  });
}
