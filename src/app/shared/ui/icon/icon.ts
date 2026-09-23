import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  featherHome,
  featherBriefcase,
  featherDatabase,
  featherFolder,
  featherCode,
  featherMail,
  featherDownload,
  featherArrowRight,
  featherArrowLeft,
  featherChevronDown,
  featherChevronRight,
  featherExternalLink,
  featherMenu,
  featherX,
  featherLinkedin,
  featherGithub,
  featherInstagram,
  featherUserCheck,
  featherInfo,
  featherAlertCircle,
  featherCheckCircle,
} from '@ng-icons/feather-icons';

const icons = {
  featherHome,
  featherBriefcase,
  featherDatabase,
  featherFolder,
  featherCode,
  featherMail,
  featherDownload,
  featherArrowRight,
  featherArrowLeft,
  featherChevronDown,
  featherChevronRight,
  featherExternalLink,
  featherMenu,
  featherX,
  featherLinkedin,
  featherGithub,
  featherInstagram,
  featherUserCheck,
  featherInfo,
  featherAlertCircle,
  featherCheckCircle,
};
export type IconName = keyof typeof icons;

@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  providers: [provideIcons(icons)],
  styleUrl: './icon.scss',
  host: { 'aria-hidden': 'true', class: 'icon' },
  templateUrl: './icon.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<'1.25em' | '1.5rem'>('1.25em');
  readonly color = input<string | undefined>();
}
