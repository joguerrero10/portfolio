import { Component } from '@angular/core';
import { FeaturedMissions } from '../../shared/ui/featured-missions/featured-missions';
import { HomeHero } from './hero/hero';

@Component({
  selector: 'app-home-page',
  imports: [FeaturedMissions, HomeHero],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {}
