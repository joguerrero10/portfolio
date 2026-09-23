import { Component, inject } from '@angular/core';
import { LocaleContext } from '../../../core/locale-context';
import { PortfolioFacade } from '../../../core/portfolio.facade';

interface TechnologyLogo {
  readonly src: string;
  readonly compactSrc?: string;
}

const TECHNOLOGY_LOGOS: Readonly<Record<string, TechnologyLogo>> = {
  AWS: { src: '/assets/images/aws.svg' },
  Azure: { src: '/assets/images/azure.svg' },
  OCI: { src: '/assets/images/OCI.svg' },
  Terraform: {
    src: '/assets/images/terraform.svg',
    compactSrc: '/assets/images/terraform-mobile.svg',
  },
};

@Component({
  selector: 'app-tech-row',
  templateUrl: './tech-row.html',
  styleUrl: './tech-row.scss',
})
export class TechRow {
  protected readonly context = inject(LocaleContext);
  protected readonly portfolio = inject(PortfolioFacade);
  protected readonly technologies = this.portfolio.coreTechnologies.map((name) => ({
    name,
    logo: TECHNOLOGY_LOGOS[name] ?? null,
  }));
}
