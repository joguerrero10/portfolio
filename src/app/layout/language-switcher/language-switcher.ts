import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router, RouterLink, UrlSegment } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { LocaleContext } from '../../core/locale-context';
import { LOCALES } from '../../domain/locale';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-language-switcher',
  imports: [Icon, RouterLink],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(keydown.escape)': 'closeAndRefocus()',
  },
})
export class LanguageSwitcher {
  protected readonly context = inject(LocaleContext);
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly links = computed(() =>
    LOCALES.map((locale) => {
      const tree = this.router.parseUrl(this.url());
      const primary = tree.root.children[PRIMARY_OUTLET];
      const first = primary?.segments[0];
      if (primary && first) primary.segments[0] = new UrlSegment(locale, first.parameters);
      return { locale, url: first ? tree : this.router.createUrlTree(['/', locale]) };
    }),
  );

  protected close() {
    this.open.set(false);
  }

  protected closeOnOutsideClick(event: Event) {
    const target = event.target;
    if (!this.open() || !(target instanceof Node)) return;
    if (!this.host.nativeElement.contains(target)) this.close();
  }

  protected closeAndRefocus() {
    if (!this.open()) return;
    this.close();
    this.toggle()?.nativeElement.focus();
  }
}
