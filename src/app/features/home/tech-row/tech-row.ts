import { Component, inject } from '@angular/core';
import { LocaleContext } from '../../../core/locale-context';
import { PortfolioFacade } from '../../../core/portfolio.facade';

interface TechnologyLogo {
  readonly src: string;
  // Variante para pantallas estrechas, donde el wordmark completo no cabe en la fila.
  readonly compactSrc?: string;
}

// Los wordmarks oficiales ya incluyen el nombre de la marca: el texto queda para lectores de
// pantalla. Una tecnología sin logo cae al nombre visible en lugar de desaparecer de la fila.
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
