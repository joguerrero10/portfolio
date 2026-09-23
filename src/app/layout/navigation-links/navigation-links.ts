import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocaleContext } from '../../core/locale-context';
import { Icon, IconName } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-navigation-links',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './navigation-links.html',
  styleUrl: './navigation-links.scss',
  host: { '[class.links--bar]': "layout() === 'bar'" },
})
export class NavigationLinks {
  readonly layout = input<'stack' | 'bar'>('stack');
  readonly navigated = output<void>();
  protected readonly context = inject(LocaleContext);
  protected readonly sections: readonly { path: string; icon: IconName }[] = [
    { path: '', icon: 'featherHome' },
    { path: 'experience', icon: 'featherDatabase' },
    { path: 'projects', icon: 'featherFolder' },
    { path: 'skills', icon: 'featherCode' },
    { path: 'contact', icon: 'featherMail' },
  ];

  protected order(index: number) {
    return String(index + 1).padStart(2, '0');
  }
}
