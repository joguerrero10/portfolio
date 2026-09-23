import { Component, computed, inject } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { MISSION_SECTIONS, MissionProgress, MissionSection } from '../../core/mission-progress';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { FeatureIntro } from '../../shared/ui/feature-intro/feature-intro';
import { Terminal } from './terminal/terminal';

@Component({
  selector: 'app-skills-page',
  imports: [FeatureIntro, Terminal],
  templateUrl: './skills.page.html',
  styleUrl: './skills.page.scss',
})
export class SkillsPage {
  protected readonly context = inject(LocaleContext);
  private readonly portfolio = inject(PortfolioFacade);
  private readonly progress = inject(MissionProgress);
  protected readonly groups = this.portfolio.getSkills();
  protected readonly sections = MISSION_SECTIONS;
  protected readonly total = this.progress.total;
  protected readonly visited = computed(() => this.progress.visited().length);

  protected isVisited(section: MissionSection) {
    return this.progress.isVisited(section);
  }

  protected label(section: MissionSection) {
    const copy = this.context.copy();
    if (section === 'recruiter') return copy.recruiter;
    const order: readonly MissionSection[] = [
      'home',
      'experience',
      'projects',
      'skills',
      'contact',
    ];
    return copy.nav[order.indexOf(section)] ?? section;
  }
}
