import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../../core/locale-context';
import { PortfolioFacade } from '../../../core/portfolio.facade';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';
import { TechRow } from '../tech-row/tech-row';

@Component({
  selector: 'app-home-hero',
  imports: [Button, Icon, RouterLink, TechRow],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HomeHero {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
}
