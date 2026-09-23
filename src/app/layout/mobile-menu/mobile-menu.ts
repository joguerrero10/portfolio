import { Component, inject, input, output } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { NavigationLinks } from '../navigation-links/navigation-links';

@Component({
  selector: 'app-mobile-menu',
  imports: [NavigationLinks],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class MobileMenu {
  readonly open = input(false);
  readonly navigated = output<void>();
  protected readonly context = inject(LocaleContext);
}
