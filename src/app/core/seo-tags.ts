import { DOCUMENT, inject, Service } from '@angular/core';
import { Locale, LOCALES } from '../domain/locale';

const JSON_LD_ID = 'portfolio-structured-data';

@Service()
export class SeoTags {
  private readonly document = inject(DOCUMENT);

  update(options: {
    origin: string | null;
    path: string;
    locale: Locale;
    structuredData: readonly Record<string, unknown>[];
  }) {
    this.canonical(options.origin, options.path);
    this.alternates(options.origin, options.path, options.locale);
    this.structuredData(options.structuredData);
  }

  private head() {
    return this.document.head;
  }

  private canonical(origin: string | null, path: string) {
    const existing = this.head().querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!origin) {
      existing?.remove();
      return;
    }
    const link = existing ?? this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${origin}${path}`);
    if (!existing) this.head().appendChild(link);
  }

  private alternates(origin: string | null, path: string, locale: Locale) {
    for (const link of this.head().querySelectorAll('link[rel="alternate"][hreflang]')) {
      link.remove();
    }
    if (!origin) return;
    const rest = path.replace(new RegExp(`^/${locale}`), '');
    for (const target of [...LOCALES, 'x-default'] as const) {
      const language = target === 'x-default' ? LOCALES[0] : target;
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', target);
      link.setAttribute('href', `${origin}/${language}${rest}`);
      this.head().appendChild(link);
    }
  }

  private structuredData(entries: readonly Record<string, unknown>[]) {
    const existing = this.head().querySelector(`script#${JSON_LD_ID}`);
    if (!entries.length) {
      existing?.remove();
      return;
    }
    const script = existing ?? this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', JSON_LD_ID);
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': entries,
    }).replaceAll('<', '\\u003c');
    if (!existing) this.head().appendChild(script);
  }
}
