import { afterNextRender, computed, DOCUMENT, inject, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { PageKey } from './localized-title.strategy';

export const PROGRESS_STORAGE_KEY = 'portfolio.missions';

// Sections that count as missions. Project details count as the projects section.
export const MISSION_SECTIONS = [
  'home',
  'experience',
  'projects',
  'skills',
  'recruiter',
  'contact',
] as const;

export type MissionSection = (typeof MISSION_SECTIONS)[number];

function isMission(value: string): value is MissionSection {
  return (MISSION_SECTIONS as readonly string[]).includes(value);
}

@Service()
export class MissionProgress {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sections = signal<readonly MissionSection[]>([]);
  readonly visited = computed(() => this.sections());
  readonly total = MISSION_SECTIONS.length;

  constructor() {
    // Restored after the first render so hydration still matches the prerendered markup.
    afterNextRender(() => this.restore());
  }

  isVisited(section: MissionSection) {
    return this.sections().includes(section);
  }

  record(page: PageKey) {
    const section = page === 'projectDetail' ? 'projects' : page;
    if (!isMission(section) || this.isVisited(section)) return;
    this.sections.update((current) => [...current, section]);
    this.persist();
  }

  private storage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private restore() {
    const stored = (() => {
      try {
        return this.storage()?.getItem(PROGRESS_STORAGE_KEY) ?? null;
      } catch {
        return null;
      }
    })();
    if (!stored) return;
    const restored = stored.split(',').filter(isMission);
    this.sections.update((current) => [
      ...current,
      ...restored.filter((section) => !current.includes(section)),
    ]);
  }

  private persist() {
    try {
      this.storage()?.setItem(PROGRESS_STORAGE_KEY, this.sections().join(','));
    } catch {
      // Progress is optional: blocked storage must never break navigation.
    }
  }
}
