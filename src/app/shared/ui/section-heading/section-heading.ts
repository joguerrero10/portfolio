import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  styleUrl: './section-heading.scss',
  host: { class: 'section-heading' },
  templateUrl: './section-heading.html',
})
export class SectionHeading {
  readonly heading = input.required<string>();
  readonly accent = input('');
  readonly description = input('');
  readonly eyebrow = input('');
  readonly level = input<1 | 2>(2);
}
