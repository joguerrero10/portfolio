import { Component, inject } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { SocialPlatform } from '../../domain/portfolio.models';
import { Icon, IconName } from '../../shared/ui/icon/icon';
import { NavigationLinks } from '../navigation-links/navigation-links';

@Component({
  selector: 'app-footer',
  imports: [Icon, NavigationLinks],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
  protected readonly names = { linkedin: 'LinkedIn', github: 'GitHub', instagram: 'Instagram' };
  protected readonly icons: Record<SocialPlatform, IconName> = {
    linkedin: 'featherLinkedin',
    github: 'featherGithub',
    instagram: 'featherInstagram',
  };
}
