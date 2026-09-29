import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isLocale } from '../../domain/locale';

const COPY = {
  es: {
    label: 'Preparando el portafolio',
    detail: 'Las grandes ideas empiezan aquí.',
    skip: 'Entrar al portafolio',
    footer: 'ARQUITECTURA PARA MISIONES REALES',
  },
  en: {
    label: 'Preparing the portfolio',
    detail: 'Great ideas start here.',
    skip: 'Enter portfolio',
    footer: 'ARCHITECTURE FOR REAL MISSIONS',
  },
  pt: {
    label: 'Preparando o portfólio',
    detail: 'Grandes ideias começam aqui.',
    skip: 'Entrar no portfólio',
    footer: 'ARQUITETURA PARA MISSÕES REAIS',
  },
};

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.scss',
})
export class LoadingScreen {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly visible = signal(false);
  readonly leaving = signal(false);
  readonly copy = signal(COPY.es);
  private minimumElapsed = false;
  private ready = false;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => this.timers.forEach(clearTimeout));
    // Browser-only: prerendered content remains accessible without JavaScript.
    afterNextRender(() => {
      const locale = this.document.location.pathname.split('/')[1];
      this.copy.set(COPY[isLocale(locale) ? locale : 'es']);
      this.visible.set(true);
      this.ready = this.router.navigated;
      this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.ready = true;
          this.finishWhenReady();
        } else if (event instanceof NavigationError) {
          this.dismiss();
        }
      });
      this.later(
        () => {
          this.minimumElapsed = true;
          this.finishWhenReady();
        },
        this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 0
          : 1200,
      );
      // Never trap visitors behind a stalled navigation.
      this.later(() => this.dismiss(), 8000);
    });
  }

  dismiss() {
    if (!this.visible() || this.leaving()) return;
    this.leaving.set(true);
    this.later(() => this.visible.set(false), 400);
  }

  private finishWhenReady() {
    if (this.ready && this.minimumElapsed) this.dismiss();
  }

  private later(callback: () => void, delay: number) {
    this.timers.push(setTimeout(callback, delay));
  }
}
