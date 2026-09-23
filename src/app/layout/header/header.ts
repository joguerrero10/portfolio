import { Component, inject, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../core/locale-context';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Button, Icon, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly menuOpen = model(false);
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
}
