import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { LocaleContext } from '../../core/locale-context';
import { Header } from '../header/header';
import { SidebarNav } from '../sidebar-nav/sidebar-nav';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, Header, SidebarNav, MobileMenu, Footer],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly context = inject(LocaleContext);
  protected readonly menuOpen = signal(false);
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd && this.menuOpen()) this.closeMenu();
      });
  }

  protected focusContent() {
    this.mainContent()?.nativeElement.focus();
  }

  protected closeMenu() {
    this.menuOpen.set(false);
    this.focusContent();
  }
}
