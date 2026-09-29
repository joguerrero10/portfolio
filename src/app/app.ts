import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingScreen } from './layout/loading-screen/loading-screen';

@Component({
  imports: [RouterOutlet, LoadingScreen],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
