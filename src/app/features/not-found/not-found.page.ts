import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleContext } from '../../core/locale-context';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
})
export class NotFoundPage {
  protected readonly context = inject(LocaleContext);
}
