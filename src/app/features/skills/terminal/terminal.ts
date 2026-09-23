import {
  Component,
  computed,
  DOCUMENT,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { LocaleContext } from '../../../core/locale-context';
import { Button } from '../../../shared/ui/button/button';

const COMMANDS = ['help', 'projects', 'skills', 'experience', 'contact', 'clear'] as const;
type Command = (typeof COMMANDS)[number];
type ResultKey = Exclude<Command, 'clear'> | 'unknown';
const ROUTED: Partial<Record<Command, string>> = {
  projects: 'projects',
  experience: 'experience',
  contact: 'contact',
};

@Component({
  selector: 'app-terminal',
  imports: [Button],
  templateUrl: './terminal.html',
  styleUrl: './terminal.scss',
})
export class Terminal {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly context = inject(LocaleContext);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly history = signal<readonly { command: string; result: ResultKey }[]>([]);
  protected readonly cleared = signal(false);

  protected readonly lines = computed(() =>
    this.history().map((entry) => ({ command: entry.command, text: this.text(entry.result) })),
  );

  protected submit(event: Event) {
    event.preventDefault();
    const field = this.field()?.nativeElement;
    const typed = (field?.value ?? '').trim().toLowerCase();
    if (field) {
      field.value = '';
      field.focus();
    }
    if (!typed) return;
    const command = (COMMANDS as readonly string[]).includes(typed) ? (typed as Command) : null;
    if (command === 'clear') {
      this.history.set([]);
      this.cleared.set(true);
      return;
    }
    this.cleared.set(false);
    this.history.update((current) => [
      ...current,
      { command: typed, result: command ?? 'unknown' },
    ]);
    const section = command ? ROUTED[command] : undefined;
    if (!section) return;
    void this.router
      .navigate(['/', this.context.locale(), section])
      .then(() => this.document.getElementById('main-content')?.focus());
  }

  private text(result: ResultKey) {
    const copy = this.context.copy();
    if (result === 'unknown') return copy.terminalUnknown;
    if (result === 'help') return `${copy.terminalResults.help} ${copy.terminalClear}`;
    return copy.terminalResults[result];
  }
}
