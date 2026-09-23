import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocaleContext } from '../../core/locale-context';
import { AppShell } from '../app-shell/app-shell';

@Component({
  selector: 'app-locale-layout',
  imports: [RouterOutlet, AppShell],
  providers: [LocaleContext],
  templateUrl: './locale-layout.html',
  styleUrl: './locale-layout.scss',
})
export class LocaleLayout {}
