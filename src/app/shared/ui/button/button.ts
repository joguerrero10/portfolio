import { Component, input } from '@angular/core';

// Keep native link/button semantics, keyboard interaction and disabled behavior.
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
