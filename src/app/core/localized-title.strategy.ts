import { inject, Service } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PRIMARY_OUTLET, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { DEFAULT_LOCALE, isLocale, Locale } from '../domain/locale';
import { PortfolioCopy } from '../domain/portfolio-copy';
import { Project } from '../domain/portfolio.models';
import { LanguageService } from './language.service';
import { MissionProgress } from './mission-progress';
import { SeoTags } from './seo-tags';
import { PortfolioFacade } from './portfolio.facade';

export type PageKey = keyof PortfolioCopy['seo'];

@Service()
export class LocalizedTitleStrategy extends TitleStrategy {
  private readonly translations = inject(TranslocoService);
  private readonly language = inject(LanguageService);
  private readonly progress = inject(MissionProgress);
  private readonly seo = inject(SeoTags);
  private readonly portfolio = inject(PortfolioFacade);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot) {
    let route = snapshot.root;
    let locale = DEFAULT_LOCALE;
    while (true) {
      const lang = route.paramMap.get('lang');
      if (isLocale(lang)) locale = lang;
      const child = route.children.find((item) => item.outlet === PRIMARY_OUTLET);
      if (!child) break;
      route = child;
    }
    const copy = this.translations.translateObject<PortfolioCopy>('portfolio', {}, locale);
    const descriptions = {
      home: copy.intro,
      experience: copy.experienceIntro,
      projects: copy.projectsIntro,
      projectDetail: copy.projectsIntro,
      skills: copy.skillsIntro,
      recruiter: copy.quickDesc,
      contact: copy.contactIntro,
      notFound: copy.errors.notFoundDescription,
    } satisfies Record<PageKey, string>;
    const page: PageKey = route.data['page'] ?? 'notFound';
    const project =
      page === 'projectDetail'
        ? this.portfolio.getProject(route.paramMap.get('slug') ?? '')
        : undefined;
    const title = `${project ? `${project.name} · ${copy.seo.projectDetail}` : copy.seo[page]} — ${this.portfolio.profile.name}`;
    const description =
      project?.id === 'smartfinance'
        ? copy.financeDetail
        : project?.id === 'smartpos'
          ? copy.posDetail
          : descriptions[page];
    this.language.commit(locale);
    this.progress.record(page);
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    const origin = this.portfolio.origin;
    this.seo.update({
      origin,
      path: snapshot.url.split(/[?#]/)[0] || `/${locale}`,
      locale,
      structuredData: this.structuredData(origin, locale, page, project),
    });
  }

  private structuredData(
    origin: string | null,
    locale: Locale,
    page: PageKey,
    project: Project | undefined,
  ): readonly Record<string, unknown>[] {
    const profile = this.portfolio.profile;
    const copy = this.translations.translateObject<PortfolioCopy>('portfolio', {}, locale);
    const person: Record<string, unknown> = {
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.role,
      email: `mailto:${profile.email}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.location.split(',')[0]?.trim() ?? profile.location,
        addressCountry: 'PA',
      },
      sameAs: Object.values(profile.socials).filter((url): url is string => url !== null),
    };
    if (origin) {
      person['@id'] = `${origin}/${locale}#person`;
      person['url'] = `${origin}/${locale}`;
    }
    const works = (
      project ? [project] : page === 'projects' ? [...this.portfolio.projects] : []
    ).map((item) => {
      const work: Record<string, unknown> = {
        '@type': 'CreativeWork',
        name: item.name,
        description: item.id === 'smartfinance' ? copy.financeDetail : copy.posDetail,
        creativeWorkStatus: item.status === 'published' ? 'Published' : 'In development',
        inLanguage: locale,
        author: origin
          ? { '@id': `${origin}/${locale}#person` }
          : { '@type': 'Person', name: profile.name },
      };
      if (origin) work['url'] = `${origin}/${locale}/projects/${item.slug}`;
      const sameAs = [item.demoUrl, item.repositoryUrl].filter(
        (url): url is string => url !== null,
      );
      if (sameAs.length) work['sameAs'] = sameAs;
      return work;
    });
    return [person, ...works];
  }
}
