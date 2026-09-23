import { Component, input } from '@angular/core';

@Component({
  selector: 'a[appButton],button[appButton]',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    class: 'button',
    '[class.button--primary]': "variant() === 'primary'",
    '[class.button--secondary]': "variant() === 'secondary'",
    '[class.button--quiet]': "variant() === 'quiet'",
  },
})
export class Button {
  readonly variant = input<'primary' | 'secondary' | 'quiet'>('secondary');
}
