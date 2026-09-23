import { Component, computed, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-inline-feedback',
  imports: [Icon],
  styleUrl: './inline-feedback.scss',
  host: {
    class: 'inline-feedback',
    '[class.inline-feedback--error]': "tone() === 'error'",
    '[class.inline-feedback--success]': "tone() === 'success'",
    '[attr.role]': "announce() ? (tone() === 'error' ? 'alert' : 'status') : null",
  },
  templateUrl: './inline-feedback.html',
})
export class InlineFeedback {
  readonly message = input.required<string>();
  readonly tone = input<'info' | 'error' | 'success'>('info');
  readonly announce = input(false);
  protected readonly icon = computed<IconName>(() => {
    if (this.tone() === 'error') return 'featherAlertCircle';
    if (this.tone() === 'success') return 'featherCheckCircle';
    return 'featherInfo';
  });
}
