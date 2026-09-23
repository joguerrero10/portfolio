import { Component, inject } from '@angular/core';
import { LocaleContext } from '../../core/locale-context';
import { NavigationLinks } from '../navigation-links/navigation-links';

// The motto sits beside the navigation, so the sidebar itself must be a landmark.
@Component({
  selector: 'app-sidebar-nav',
  imports: [NavigationLinks],
  templateUrl: './sidebar-nav.html',
  styleUrl: './sidebar-nav.scss',
  host: { role: 'complementary' },
})
export class SidebarNav {
  protected readonly context = inject(LocaleContext);
}
