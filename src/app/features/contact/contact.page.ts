import { Component, computed, inject } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { SocialPlatform } from '../../domain/portfolio.models';
import { Button } from '../../shared/ui/button/button';
import { FeatureIntro } from '../../shared/ui/feature-intro/feature-intro';
import { Icon, IconName } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-contact-page',
  imports: [Button, FeatureIntro, Icon],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss',
})
export class ContactPage {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
  protected readonly names: Record<SocialPlatform, string> = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    instagram: 'Instagram',
  };
  protected readonly icons: Record<SocialPlatform, IconName> = {
    linkedin: 'featherLinkedin',
    github: 'featherGithub',
    instagram: 'featherInstagram',
  };
  // Subject is translated and percent-encoded; the first version only opens the mail client.
  protected readonly mailto = computed(
    () =>
      `mailto:${this.portfolio.profile.email}?subject=${encodeURIComponent(
        this.context.copy().mailSubject,
      )}`,
  );
  protected readonly cvSize = Math.round(this.portfolio.profile.cv.bytes / 1024);
}
