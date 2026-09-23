import { Component, input } from '@angular/core';
import { SectionHeading } from '../section-heading/section-heading';

@Component({
  selector: 'app-feature-intro',
  imports: [SectionHeading],
  styleUrl: './feature-intro.scss',
  templateUrl: './feature-intro.html',
})
export class FeatureIntro {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly eyebrow = input('');
  readonly accent = input('');
}
